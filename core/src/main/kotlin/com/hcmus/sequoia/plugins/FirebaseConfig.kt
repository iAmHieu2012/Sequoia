package com.hcmus.sequoia.plugins

import com.hcmus.sequoia.models.*

import com.google.auth.oauth2.GoogleCredentials
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.cloud.FirestoreClient
import io.ktor.server.application.Application
import java.io.File
import java.io.FileInputStream

/**
 * Singleton configuration for Firebase services.
 * 
 * Initializes the Firebase Admin SDK to interact with Firestore and Firebase Auth
 * using application default credentials.
 */
object FirebaseConfig {
    
    /**
     * Initializes FirebaseApp if it hasn't been initialized yet.
     * 
     * @param application The Ktor application instance used for logging.
     */
    fun init(application: Application) {
        // Initialization is now delegated to Security.kt (via kborowy.firebaseAuthProvider)
        // to prevent "FirebaseApp name [DEFAULT] already exists!" errors, 
        // since the auth plugin strictly requires handling the initialization.
        application.environment.log.info("Firebase initialization delegated to Security.kt")
    }

    /**
     * Lazily initialized Firestore client instance.
     */
    val firestore by lazy {
        FirestoreClient.getFirestore()
    }
}

/**
 * Ktor module configuration to set up Firebase services on application startup.
 */
fun Application.configureFirebase() {
    FirebaseConfig.init(this)
}
