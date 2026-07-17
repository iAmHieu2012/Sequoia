package com.hcmus.sequoia.models

import kotlinx.serialization.Serializable

@Serializable
data class PlaygroundBlock(
    val modelId: String = "",
    val position: Int = 0,
    val defaultConfig: Map<String, String> = emptyMap()
)

/**
 * Data class representing an Article.
 * 
 * @property id The unique document ID.
 * @property title Title of the article.
 * @property slug URL-friendly slug.
 * @property content Markdown content.
 * @property summary Short summary.
 * @property chapterId Optional reference to a chapter.
 * @property topicId Optional reference to a topic.
 * @property textbookId Optional reference to a textbook.
 * @property playgroundBlocks List of playground block configs embedded.
 * @property tags List of tags.
 * @property isPublished Boolean indicating if it is published.
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
    val isPublished: Boolean = false
)
