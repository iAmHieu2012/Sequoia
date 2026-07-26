package com.hcmus.sequoia.plugins

import com.hcmus.sequoia.models.AppException
import com.hcmus.sequoia.models.ErrorResponse
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*

fun Application.configureErrorHandling() {
    install(StatusPages) {
        exception<AppException> { call, cause ->
            call.respond(
                cause.statusCode,
                ErrorResponse(
                    code = cause.errorCode,
                    message = cause.message,
                    details = cause.details
                )
            )
        }
        
        exception<Throwable> { call, cause ->
            cause.printStackTrace()
            call.respond(
                HttpStatusCode.InternalServerError,
                ErrorResponse(
                    code = "INTERNAL_ERROR",
                    message = "Unknown server error: ${cause.localizedMessage}"
                )
            )
        }
        
        status(HttpStatusCode.TooManyRequests) { call, status ->
            call.respond(
                status,
                ErrorResponse(
                    code = "TOO_MANY_REQUESTS",
                    message = "Too many requests. Please try again later.",
                    details = null
                )
            )
        }

        status(HttpStatusCode.Unauthorized) { call, status ->
            call.respond(
                status,
                ErrorResponse(
                    code = "UNAUTHORIZED",
                    message = "Invalid or expired token.",
                    details = null
                )
            )
        }
    }
}
