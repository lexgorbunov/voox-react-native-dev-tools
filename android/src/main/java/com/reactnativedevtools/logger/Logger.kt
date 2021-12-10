package com.reactnativedevtools.logger

import android.content.Context
import android.os.Handler
import android.os.HandlerThread
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactMethod
import java.io.File

class Logger(private val context: Context) {

    private val queue by lazy {
        val thread = HandlerThread("AppLoggerQueue")
        thread.start()
        return@lazy Handler(thread.looper)
    }

    @ReactMethod
    fun writeLog(message: String, promise: Promise? = null) {
        queue.post {
            ///data/user/0/adverto.sale/files/log.text
            val file = File(context.filesDir, "log.text")
            if (!file.exists()) file.createNewFile()
            file.appendText(message)
            file.appendText("\n")
            promise?.resolve("")
        }
    }
}
