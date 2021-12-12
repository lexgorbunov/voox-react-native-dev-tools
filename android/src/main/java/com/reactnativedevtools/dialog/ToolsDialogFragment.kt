package com.reactnativedevtools.dialog

import android.app.Activity
import android.app.Dialog
import android.content.DialogInterface
import android.os.Bundle
import android.util.DisplayMetrics
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ImageView
import com.google.android.material.bottomsheet.BottomSheetBehavior
import com.google.android.material.bottomsheet.BottomSheetBehavior.BottomSheetCallback
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.google.android.material.textfield.TextInputEditText
import com.reactnativedevtools.R
import com.reactnativedevtools.RoundAllCornersProvider
import com.reactnativedevtools.RoundTopCornersProvider
import com.reactnativedevtools.screenshot.ScreenShotHelper


private const val ARG_SCREENSHOT_SRC = "arg-screenshot-src"

class ToolsDialogFragment : BottomSheetDialogFragment() {

  companion object {
    fun newInstance(screenshot: String?): ToolsDialogFragment = ToolsDialogFragment().apply {
      arguments = Bundle().apply {
        screenshot?.let { putString(ARG_SCREENSHOT_SRC, it) }
      }
    }

    const val REQUEST_KEY = "DevToolsDialog-result-key"
    const val RESULT_KEY_ACTION = "action-key"
    const val RESULT_KEY_SCREENSHOT = "screenshot-key"
    const val RESULT_KEY_SUMMARY = "summary-key"

    const val ACTION_DISMISS = "dismiss"
    const val ACTION_SEND = "send"
  }

  private val bottomSheetCallback = object : BottomSheetCallback() {
    override fun onStateChanged(bottomSheet: View, newState: Int) {
      if (newState == BottomSheetBehavior.STATE_HIDDEN) dismiss()
    }

    override fun onSlide(bottomSheet: View, slideOffset: Float) = Unit
  }

  override fun onCreateView(
    inflater: LayoutInflater, container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View? {
    return inflater.inflate(R.layout.fragment_tools_dialog, container, false)
  }

  override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    val screenshot = arguments?.getString(ARG_SCREENSHOT_SRC)
    screenshot?.let {
      val bitmap = ScreenShotHelper.decodeImage(screenshot)
      view.findViewById<ImageView>(R.id.screenshotImg).also {
        it.setImageBitmap(bitmap)
      }
    }
    val button = view.findViewById<Button>(R.id.sendBtn)
    button.clipToOutline = true
    button.outlineProvider = RoundAllCornersProvider(12f)
    button.setOnClickListener {
      parentFragmentManager.setFragmentResult(REQUEST_KEY, Bundle().apply {
        putString(RESULT_KEY_ACTION, ACTION_SEND)
        screenshot?.let { putString(RESULT_KEY_SCREENSHOT, it) }
        putString(RESULT_KEY_SUMMARY, view.findViewById<TextInputEditText>(R.id.summary).text.toString())
      })
      dismissAllowingStateLoss()
    }
    (view.parent as View?)?.let { handle ->
      handle.clipToOutline = true
      handle.outlineProvider = RoundTopCornersProvider(12f)
    }
  }

  override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
    return super.onCreateDialog(savedInstanceState).also {
      it.setOnShowListener { dialog ->
        dialog as BottomSheetDialog
        val bottomSheet = dialog
          .findViewById<FrameLayout>(com.google.android.material.R.id.design_bottom_sheet)!!
        val behavior: BottomSheetBehavior<*> = BottomSheetBehavior.from<View>(bottomSheet)
        val layoutParams: ViewGroup.LayoutParams = bottomSheet.layoutParams
        layoutParams.height = getBottomSheetDialogDefaultHeight()
        bottomSheet.layoutParams = layoutParams
        behavior.state = BottomSheetBehavior.STATE_EXPANDED
        behavior.skipCollapsed = true
        behavior.addBottomSheetCallback(bottomSheetCallback)
      }
    }
  }

  override fun onDismiss(dialog: DialogInterface) {
    parentFragmentManager.setFragmentResult(REQUEST_KEY, Bundle().apply {
      putString(RESULT_KEY_ACTION, ACTION_DISMISS)
    })
    super.onDismiss(dialog)
  }

  private fun getBottomSheetDialogDefaultHeight(): Int = (getWindowHeight() * 0.95).toInt()

  private fun getWindowHeight(): Int {
    // Calculate window height for fullscreen use
    val displayMetrics = DisplayMetrics()
    (context as Activity?)!!.windowManager.defaultDisplay.getMetrics(displayMetrics)
    return displayMetrics.heightPixels
  }
}
