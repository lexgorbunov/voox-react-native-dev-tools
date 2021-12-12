package com.reactnativedevtools.screenshot


import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64
import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import java.io.ByteArrayOutputStream
import java.io.File


object ScreenShotHelper {
  fun takeScreenShot(context: ReactApplicationContext): String? =
    try {
      val v1: View = context.currentActivity!!.window.decorView.rootView
      v1.isDrawingCacheEnabled = true
      val bitmap: Bitmap = Bitmap.createBitmap(v1.drawingCache)
      v1.isDrawingCacheEnabled = false
      val base64 = encodeImage(bitmap)
      bitmap.recycle()
      base64
    } catch (e: Throwable) {
      // Several error may come out with file handling or DOM
      e.printStackTrace()
      null
    }

  fun decodeImage(encodedImage: String): Bitmap {
    val decodedString: ByteArray = Base64.decode(encodedImage, Base64.NO_WRAP)
    return BitmapFactory.decodeByteArray(decodedString, 0, decodedString.size)
  }

  private fun encodeImage(bm: Bitmap): String? {
    val baos = ByteArrayOutputStream()
    bm.compress(Bitmap.CompressFormat.JPEG, 90, baos)
    val b = baos.toByteArray()
    return Base64.encodeToString(b, Base64.NO_WRAP)
  }

  fun saveToTempDirectory(context: Context, base64Screenshot: String): String {
    val path = File(context.cacheDir, "screenshot.jpg")
    if (path.exists()) path.delete()
    path.outputStream().use {
      val decodedString: ByteArray = Base64.decode(base64Screenshot, Base64.NO_WRAP)
      it.write(decodedString)
    }
    return path.absolutePath
  }

}
