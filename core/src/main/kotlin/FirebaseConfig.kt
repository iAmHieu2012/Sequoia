package com.hcmus.sequoia

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
        if (FirebaseApp.getApps().isEmpty()) {
            val keyFile = File("firebase-key.json")
            val credentials = if (keyFile.exists()) {
                GoogleCredentials.fromStream(FileInputStream(keyFile))
            } else {
                application.environment.log.warn("firebase-key.json not found. Falling back to Application Default Credentials.")
                GoogleCredentials.getApplicationDefault()
            }

            val options = FirebaseOptions.builder()
                .setCredentials(credentials)
                .build()

            FirebaseApp.initializeApp(options)
            application.environment.log.info("Firebase Admin SDK initialized successfully.")
        }
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
