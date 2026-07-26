package com.hcmus.sequoia.plugins

import com.hcmus.sequoia.models.ErrorResponse
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.plugins.*
import io.ktor.server.plugins.forwardedheaders.*
import io.ktor.server.plugins.ratelimit.*
import io.ktor.server.response.*
import kotlin.time.Duration.Companion.seconds

fun Application.configureRateLimiting() {
    // 1. Đọc IP thật từ Proxy (Render)
    install(ForwardedHeaders)
    install(XForwardedHeaders)

    // 2. Cài đặt RateLimit
    install(RateLimit) {
        global {
            // Giới hạn 50 requests mỗi 60 giây
            rateLimiter(limit = 50, refillPeriod = 60.seconds)
            
            // Lấy IP thật của khách hàng (đã được XForwardedHeaders bóc ra)
            requestKey { call -> 
                call.request.origin.remoteHost 
            }
        }
        
        // Trả về JSON chuẩn khi bị khoá
        // Note: global rate limit is applied to all endpoints if not explicitly excluded
    }
}
