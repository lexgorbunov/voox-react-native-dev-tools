package com.reactnativedevtools

import android.os.Handler
import android.os.HandlerThread
import com.facebook.react.ReactActivity
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.reactnativedevtools.dialog.ToolsDialogFragment
import com.reactnativedevtools.logger.Logger
import com.reactnativedevtools.screenshot.ScreenShotHelper

private const val DIALOG_TAG = "DevToolsDialog"

@ReactModule(name = DevToolsModule.NAME)
class DevToolsModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "DevTools"
    }

    private val logger = Logger(reactContext, "log.text")

    override fun getName(): String = NAME

    private val queue by lazy {
        val thread = HandlerThread("AppLoggerQueue")
        thread.start()
        return@lazy Handler(thread.looper)
    }

    @ReactMethod
    fun writeLog(message: String?) {
        message ?: return
        logger.writeLog(message)
    }

    @ReactMethod
    fun removeLogFile(promise: Promise) {
        logger.removeLogFile(promise)
    }

    @ReactMethod
    fun screenshot(promise: Promise) {
        val base64Image = ScreenShotHelper.takeScreenShot(reactContext)
        promise.resolve(base64Image ?: "")
    }

    @ReactMethod
    fun getAllLogs(promise: Promise) {
        promise.resolve("<Logs>")
    }

    @ReactMethod
    fun presentDevTools(promise: Promise) {
        val reactActivity = reactContext.currentActivity as ReactActivity
        val fm = reactActivity.supportFragmentManager
        val screenBase64 = ScreenShotHelper.takeScreenShot(reactContext)
        UiThreadUtil.runOnUiThread {
            ToolsDialogFragment.newInstance(screenshot = screenBase64).apply {
                fm.setFragmentResultListener(
                    ToolsDialogFragment.REQUEST_KEY,
                    this,
                    { _, result ->
                        val action = result.getString(
                            ToolsDialogFragment.RESULT_KEY_ACTION,
                            ToolsDialogFragment.ACTION_DISMISS
                        )
                        val screenshot = result.getString(ToolsDialogFragment.RESULT_KEY_SCREENSHOT)
                        promise.resolve(makePresentResult(action = action, screenshot = screenshot))
                    }
                )
            }.show(fm, DIALOG_TAG)
        }
    }

    private fun makePresentResult(action: String, screenshot: String?): WritableMap? {
        return when (action) {
            "send" -> Arguments.createMap().also { result ->
                result.putString("logFile", logger.logFile.absolutePath)
                if (!screenshot.isNullOrBlank()) result.putString("screenshot", screenshot)
            }
            else -> null
        }
    }
}
