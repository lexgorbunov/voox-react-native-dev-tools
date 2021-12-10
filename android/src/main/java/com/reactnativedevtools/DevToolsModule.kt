package com.reactnativedevtools

import android.os.Handler
import android.os.HandlerThread
import com.facebook.react.ReactActivity
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.reactnativedevtools.dialog.ToolsDialogFragment
import com.reactnativedevtools.logger.Logger
import com.reactnativedevtools.screenshot.ScreenShotHelper

private const val DIALOG_TAG = "DevToolsDialog"

@ReactModule(name = DevToolsModule.NAME)
class DevToolsModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    private val logger = Logger(reactContext)

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
    fun screenshot(promise: Promise) {
        val base64Image = ScreenShotHelper.takeScreenShot(reactContext)
        println("🔦 "+base64Image)
        promise.resolve(base64Image ?: "")
    }

    @ReactMethod
    fun getAllLogs(promise: Promise) {
        println("🔦 Работает! getAllLogs")
        promise.resolve("<Logs>")
    }

    @ReactMethod
    fun presentDevTools(promise: Promise) {
        val fm = (reactContext.currentActivity as ReactActivity).supportFragmentManager
        val screenBase64 = ScreenShotHelper.takeScreenShot(reactContext)
        ToolsDialogFragment.newInstance(screenshot = screenBase64).show(fm, DIALOG_TAG)
        promise.resolve("")
    }

    companion object {
        const val NAME = "DevTools"
//        external fun nativeMultiply(a: Int, b: Int): Int
    }
}
