package com.hcmus.sequoia.plugins

import com.hcmus.sequoia.models.*

import io.ktor.server.application.*
import io.ktor.server.auth.*
import java.io.File
import com.kborowy.authprovider.firebase.firebase

fun Application.configureSecurity() {
    val myAdminFile = File("firebase-key.json")
    if (!myAdminFile.exists()) {
        environment.log.warn("firebase-key.json not found. Authentication setup may fail.")
    }
    
    install(Authentication) {
        firebase {
            setup {
                adminFile = myAdminFile
            }
            realm = "My Server"
            validate { token ->
                MyAuthenticatedUser(id = token.uid)
            }
        }
    }
}