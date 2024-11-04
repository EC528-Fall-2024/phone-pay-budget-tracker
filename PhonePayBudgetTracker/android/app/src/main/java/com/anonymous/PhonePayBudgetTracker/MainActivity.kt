package com.anonymous.PhonePayBudgetTracker

import android.os.Bundle
import com.facebook.react.ReactActivity

class MainActivity : ReactActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun getMainComponentName(): String {
        return "main"
    }
}


// package com.anonymous.PhonePayBudgetTracker

// import android.os.Build
// import android.os.Bundle
// import android.widget.Toast
// import com.facebook.react.ReactActivity
// import com.facebook.react.ReactActivityDelegate
// import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
// import com.facebook.react.defaults.DefaultReactActivityDelegate
// import expo.modules.ReactActivityDelegateWrapper

// // Plaid and OkHttp Imports
// import com.plaid.link.Plaid
// import com.plaid.link.configuration.LinkTokenConfiguration
// import com.plaid.link.result.LinkResult
// import com.plaid.link.result.LinkResultHandler
// import com.plaid.link.configuration.PlaidEnvironment
// import okhttp3.*
// import org.json.JSONObject
// import java.io.IOException
// import okhttp3.MediaType.Companion.toMediaType
// import okhttp3.RequestBody.Companion.toRequestBody

// class MainActivity : ReactActivity() {

//     // Plaid Link result handler
//     private val linkResultHandler = LinkResultHandler { result: LinkResult ->
//         when (result) {
//             is LinkResult.OnSuccess -> {
//                 val publicToken = result.publicToken
//                 sendPublicTokenToBackend(publicToken)
//             }
//             is LinkResult.OnExit -> {
//                 val error = result.error
//                 Toast.makeText(this, error?.message ?: "Exited Plaid Link", Toast.LENGTH_SHORT).show()
//             }
//         }
//     }

//     override fun onCreate(savedInstanceState: Bundle?) {
//         setTheme(R.style.AppTheme)
//         super.onCreate(null)
//         val linkToken = intent.getStringExtra("linkToken") ?: ""
//         if (linkToken.isNotEmpty()) {
//             initializePlaidLink(linkToken)
//         }
//     }

//     // Initialize and open Plaid Link
//     private fun initializePlaidLink(linkToken: String) {
//         val linkTokenConfig = LinkTokenConfiguration.Builder()
//             .token(linkToken)
//             .onSuccess { success ->
//                 val publicToken = success.publicToken
//                 sendPublicTokenToBackend(publicToken)
//             }
//             .onExit { exit ->
//                 val errorMessage = exit.error?.displayMessage ?: "Exited Plaid Link"
//                 Toast.makeText(this, errorMessage, Toast.LENGTH_SHORT).show()
//             }
//             .environment(PlaidEnvironment.SANDBOX) // Set environment
//             .build()

//         // Plaid.create(this, linkTokenConfig).open(this)
//         Plaid.create(applicationContext, linkTokenConfig).open(this)
//     }

//     // Send public token to backend
//     private fun sendPublicTokenToBackend(publicToken: String) {
//         val client = OkHttpClient()
//         val jsonBody = JSONObject().apply {
//             put("public_token", publicToken)
//         }
//         val requestBody = jsonBody.toString().toRequestBody("application/json; charset=utf-8".toMediaType())
//         val request = Request.Builder()
//             .url("http://localhost:3000/trans-dataanalysis/plaid/get_transactions")
//             .post(requestBody)
//             .build()

//         client.newCall(request).enqueue(object : Callback {
//             override fun onFailure(call: Call, e: IOException) {
//                 runOnUiThread {
//                     Toast.makeText(this@MainActivity, "Error sending token", Toast.LENGTH_SHORT).show()
//                 }
//             }

//             override fun onResponse(call: Call, response: Response) {
//                 if (response.isSuccessful) {
//                     runOnUiThread {
//                         Toast.makeText(this@MainActivity, "Token sent successfully", Toast.LENGTH_SHORT).show()
//                     }
//                 } else {
//                     runOnUiThread {
//                         Toast.makeText(this@MainActivity, "Failed to send token", Toast.LENGTH_SHORT).show()
//                     }
//                 }
//             }
//         })
//     }

//     override fun getMainComponentName(): String = "main"

//     override fun createReactActivityDelegate(): ReactActivityDelegate {
//         return ReactActivityDelegateWrapper(
//             this,
//             BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
//             object : DefaultReactActivityDelegate(
//                 this,
//                 mainComponentName,
//                 fabricEnabled
//             ) {}
//         )
//     }

//     override fun invokeDefaultOnBackPressed() {
//         if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
//             if (!moveTaskToBack(false)) {
//                 super.invokeDefaultOnBackPressed()
//             }
//             return
//         }
//         super.invokeDefaultOnBackPressed()
//     }
// }

