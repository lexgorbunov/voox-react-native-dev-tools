package com.reactnativedevtools

import android.content.Context
import android.hardware.SensorManager
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleObserver
import androidx.lifecycle.OnLifecycleEvent
import com.facebook.react.ReactActivity
import com.facebook.react.bridge.*
import com.facebook.react.common.ShakeDetector
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.reactnativedevtools.dialog.ToolsDialogFragment
import com.reactnativedevtools.logger.Logger
import com.reactnativedevtools.screenshot.ScreenShotHelper
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.async

private const val DIALOG_TAG = "DevToolsDialog"

@ReactModule(name = DevToolsModule.NAME)
class DevToolsModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext), LifecycleObserver {

  companion object {
    const val NAME = "DevTools"
    const val DATA_KEY = "DevToolsData"
  }

  private val logger = Logger(reactContext, "log.text")
  private val shaker = ShakeDetector({
    sendEvent(DATA_KEY)
  }, 2)
  private var shakerEnabled = false
  private var shakerStarted = false

  @ReactMethod
  fun enableShaker(enabled: Boolean) {
    shakerEnabled = enabled
    if (enabled) enableShakerInternal() else disableShakerInternal()
  }

  @OnLifecycleEvent(Lifecycle.Event.ON_START)
  fun enableShakerInternal() {
    if (shakerEnabled) {
      shaker.start(reactContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager)
      shakerStarted = true
    }
  }

  @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
  fun disableShakerInternal() {
    if (shakerStarted) {
      shaker.stop()
      shakerStarted = false
    }
  }

  override fun getName(): String = NAME

  @ReactMethod
  fun writeLog(message: String?, promise: Promise) {
    if (message == null) {
      promise.resolve(false)
      return
    }
    logger.writeLog(message)
    promise.resolve(true)
  }

  @ReactMethod
  fun deleteLogFile(promise: Promise) {
    logger.removeLogFile(promise)
  }

  @ReactMethod
  fun screenshot(promise: Promise) {
    val base64Image = ScreenShotHelper.takeScreenShot(reactContext)
    promise.resolve(base64Image ?: "")
  }

  @ReactMethod
  fun getAllLogs(promise: Promise) {
    val file = logger.logFile
    if (!file.exists()) {
      promise.resolve(null)
      return
    }
    promise.resolve(file.readText(Charsets.UTF_8))
  }

  @ReactMethod
  fun presentDevTools(promise: Promise) {
    showDialog(promise::resolve)
  }

  private fun showDialog(onFinish: (data: WritableMap?) -> Unit) {
    val reactActivity = reactContext.currentActivity as ReactActivity
    val fm = reactActivity.supportFragmentManager
    UiThreadUtil.runOnUiThread {
      val screenBase64 = ScreenShotHelper.takeScreenShot(reactContext)
      ToolsDialogFragment.newInstance(screenshot = screenBase64).apply {
        fm.setFragmentResultListener(
          ToolsDialogFragment.REQUEST_KEY,
          this,
          { _, result ->
            val action = result.getString(
              ToolsDialogFragment.RESULT_KEY_ACTION,
              ToolsDialogFragment.ACTION_DISMISS
            )
            if (action == ToolsDialogFragment.ACTION_DISMISS) return@setFragmentResultListener
            val screenshot = result.getString(ToolsDialogFragment.RESULT_KEY_SCREENSHOT)
            GlobalScope.async {
              var path: String? = null
              if (screenshot != null) {
                path = ScreenShotHelper.saveToTempDirectory(reactContext, screenshot)
              }
              onFinish(makePresentResult(
                action = action,
                screenshot = path,
                summary = result.getString(ToolsDialogFragment.RESULT_KEY_SUMMARY)
              ))
            }
          }
        )
      }.show(fm, DIALOG_TAG)
    }
  }

  private fun makePresentResult(action: String, screenshot: String?, summary: String?): WritableMap? {
    return when (action) {
      "send" -> Arguments.createMap().also { result ->
        result.putString("logFilePath", logger.logFile.absolutePath)
        if (!summary.isNullOrBlank())result.putString("summary", summary)
        if (!screenshot.isNullOrBlank()) result.putString("screenshotPath", screenshot)
      }
      else -> null
    }
  }

  private fun sendEvent(eventName: String) {
    if (!reactContext.hasActiveCatalystInstance()) return
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, Arguments.createMap())
  }
}
