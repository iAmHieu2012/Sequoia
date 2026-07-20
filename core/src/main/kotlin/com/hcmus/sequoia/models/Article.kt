package com.hcmus.sequoia.models

import kotlinx.serialization.Serializable

/**
 * Data class representing a Playground Block embedded in an article.
 *
 * @property modelId The ID of the model to load.
 * @property position The position of the block in the markdown content.
 * @property defaultConfig The default configuration map (e.g., threshold, inputSize).
 */
@Serializable
data class PlaygroundBlock(
    val modelId: String = "",
    val position: Int = 0,
    val defaultConfig: Map<String, String> = emptyMap()
)

/**
 * Data class representing an Article.
 * 
 * @property id The unique document ID from Firestore.
 * @property title Title of the article.
 * @property slug URL-friendly slug.
 * @property content Markdown content of the article.
 * @property summary Short summary.
 * @property chapterId Optional reference to a chapter.
 * @property topicId Optional reference to a topic.
 * @property textbookId Optional reference to a textbook.
 * @property playgroundBlocks List of playground block configs embedded.
 * @property tags List of tags for searching and filtering.
 * @property isPublished Boolean indicating if it is published.
 * @property createdAt Timestamp when the article was created.
 * @property updatedAt Timestamp when the article was last updated.
 * @property publishedAt Timestamp when the article was published.
 */
@Serializable
data class Article(
    var id: String = "",
    val title: String = "",
    val slug: String = "",
    val content: String = "",
    val summary: String = "",
    val chapterId: String? = null,
    val topicId: String? = null,
    val textbookId: String? = null,
    val playgroundBlocks: List<PlaygroundBlock> = emptyList(),
    val tags: List<String> = emptyList(),
    @get:com.google.cloud.firestore.annotation.PropertyName("isPublished")
    @set:com.google.cloud.firestore.annotation.PropertyName("isPublished")
    var isPublished: Boolean = false,
    val createdAt: Long = 0L,
    val updatedAt: Long = 0L,
    val publishedAt: Long = 0L
)
