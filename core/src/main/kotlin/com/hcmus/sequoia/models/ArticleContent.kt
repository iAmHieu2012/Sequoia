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
 * Data class representing the heavy content of an Article.
 * Maps to the 'article_contents' collection in Firestore.
 * 
 * @property id The unique document ID, matching the Article's ID.
 * @property content Markdown content of the article.
 * @property playgroundBlocks List of playground block configs embedded.
 */
@Serializable
data class ArticleContent(
    var id: String = "",
    val content: String = "",
    val playgroundBlocks: List<PlaygroundBlock> = emptyList()
)
