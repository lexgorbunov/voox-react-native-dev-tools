package com.reactnativedevtools.logger

import android.content.Context
import android.os.Handler
import android.os.HandlerThread
import com.facebook.react.bridge.Promise
import java.io.File

class Logger(context: Context, logFileName: String) {

    val logFile = File(context.filesDir, logFileName)

    val queue by lazy {
        val thread = HandlerThread("AppLoggerQueue")
        thread.start()
        return@lazy Handler(thread.looper)
    }

    fun writeLog(message: String, promise: Promise? = null) {
        queue.post {
            ///data/user/0/adverto.sale/files/log.text
            if (!logFile.exists()) logFile.createNewFile()
            logFile.appendText(message)
            logFile.appendText("\n")
            promise?.resolve("")
        }
    }

    fun removeLogFile(promise: Promise) {
      queue.post {
        if (logFile.exists()) {
          logFile.delete()
          promise.resolve(true)
          return@post
        }
        promise.resolve(false)
      }
    }
}
