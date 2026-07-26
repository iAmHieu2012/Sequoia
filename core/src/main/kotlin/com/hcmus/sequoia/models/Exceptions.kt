package com.hcmus.sequoia.models

import io.ktor.http.HttpStatusCode
import kotlinx.serialization.Serializable

/**
 * Standard error response format returned to the client.
 * Matches the format defined in api-contract.md.
 * 
 * @property code Custom application error code (e.g. RESOURCE_NOT_FOUND).
 * @property message Human-readable error message.
 * @property details Optional map containing additional error context.
 */
@Serializable
data class ErrorResponse(
    val code: String,
    val message: String,
    val details: Map<String, String>? = null
)

/**
 * Base exception for all custom application errors.
 * StatusPages will catch this and convert it to an ErrorResponse.
 * 
 * @property statusCode HTTP status code to return.
 * @property errorCode Custom application error code.
 * @property message Human-readable error message.
 * @property details Optional map containing additional error context.
 */
open class AppException(
    val statusCode: HttpStatusCode,
    val errorCode: String,
    override val message: String,
    val details: Map<String, String>? = null
) : RuntimeException(message)

/**
 * Exception thrown when a requested resource is not found (404).
 */
class NotFoundException(
    message: String = "Resource not found",
    details: Map<String, String>? = null
) : AppException(HttpStatusCode.NotFound, "RESOURCE_NOT_FOUND", message, details)

/**
 * Exception thrown when a request is invalid or malformed (400).
 */
class BadRequestException(
    message: String = "Invalid request",
    details: Map<String, String>? = null
) : AppException(HttpStatusCode.BadRequest, "INVALID_REQUEST", message, details)

/**
 * Exception thrown when authentication fails or is missing (401).
 */
class UnauthorizedException(
    message: String = "Unauthorized",
    details: Map<String, String>? = null
) : AppException(HttpStatusCode.Unauthorized, "UNAUTHORIZED", message, details)
