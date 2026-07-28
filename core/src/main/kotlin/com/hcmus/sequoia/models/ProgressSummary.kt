package com.hcmus.sequoia.models

import kotlinx.serialization.Serializable

@Serializable
data class ProgressSummary(
    val textbooks: Map<String, CategoryProgress> = emptyMap(),
    val topics: Map<String, CategoryProgress> = emptyMap(),
    val standalone: Map<String, String> = emptyMap()
)

@Serializable
data class CategoryProgress(
    val total: Int = 0,
    val completed: Int = 0,
    val decoding: Int = 0
)
