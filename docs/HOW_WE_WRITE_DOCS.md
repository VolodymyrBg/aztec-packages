# How we write docs

This doc covers the structure and tone of Aztec developer documentation. For the contribution guidelines, go [here](./CONTRIBUTING.md). Please keep in mind that this is constantly changing. 

## Structure

### High level

Aztec docs are divided into two main sections - `Learn` and `Build`. 

Anyone technical can read the `Learn` section, whereas only developers who are actively building or starting to build on Aztec will read the `Build` section.

The `Learn` section contains [explanations](#explainations) of each of the concepts that make up Aztec, going into much more detail than is required by developers who just want to build something.

The `Build` section contains information that only developers need to know - this can be related to setting up or interacting with a local environment, writing smart contracts, or using Aztec.js.

### Types of pages

The Aztec docs roughly follow the [Diataxis](https://diataxis.fr/) framework. It is recommended to read this website before contributing to the docs. 

Every page will fall into **one type of doc**. If your contribution covers multiple types, you will need to split it into multiple pages.

#### Explanations

These answer the question "What is...?" and don't have any direct implications for what the reader does. It helps readers understand a concept. These can exist in both `Learn` and `Build` sections of the docs, depending on the context of the explanations. For example, a doc explaining UTXOs would sit in `Learn`, but explaining how Aztec.nr abstracts UTXOs would sit in `Build`.

#### Tutorials

These are follow-along experiences that guide the reader into building something. In the context of Aztec docs, these are generally project-oriented rather than feature-oriented. For example, a developer might learn how to build a private token rather than focusing on how to use a specific Aztec privacy feature. It does not expect too much prior knowledge from the developer and does not expect that they have a goal in mind aside from learning. They currently only exist in `Build`.

#### How-tos

These are guides for the reader to accomplish a specific goal. In the context of Aztec docs, how-to guides usually cover a specific feature, library, or setup. It expects the reader to know why they are there and does not provide any additional context than needed. They currently only exist in `Build`.

#### References

These are docs that developers can consult to know exact and succinct information about a specific library or feature. In the case of Aztec, it usually consists of lists of callable functions, their parameters, and return types. Most Aztec references are autogenerated. They currently only exist in `Build`.

## Tone

* Concise and informative - for example, rather than repeating information, write "to learn more, read ..."
* Friendly and empathetic - for example, "you do not have to worry about this yet" 
* Simple and jardon-avoidant when possible 
* Short sentences
* Unopinionated language - we know things are exciting sometimes, but try not to tell the developer what they should be excited about

## Grammar

To keep docs consistent and easily searchable, follow these grammar guidelines:

* Write in American English
* When talking about ZK, use:
    * `zero knowledge` as the noun
    * `zero-knowledge` as the adjective
    * `ZK` for subsequent mentions of zero knowledge and zero-knowledge on the same page
* Do not end bullet points with any punctuation, such as periods or semi-colons (most of the time)
* Use numbered bullets when the order is important, such as steps in a guide or hierarchies of dependencies
* Write with [active voice](https://www.grammarly.com/blog/active-vs-passive-voice/) in tutorials and how-tos, and passive voice in explanations
* Use the [Oxford comma](https://www.grammarly.com/blog/what-is-the-oxford-comma-and-why-do-people-care-so-much-about-it/)
* Avoid exclamation points

# Docusaurus and discoverability

## URLs

Markdown links by file (with extension).
Can be relative to current path (`./`, `../`), eg within a section, or absolute (relative to docs).
[link1](https://docusaurus.io/docs/markdown-features/links), [link2](https://docusaurus.io/docs/versioning#link-docs-by-file-paths)

If you spot a broken URL, ping us in [Discord](https://discord.com/invite/aztec) or create an issue :)

## Keywords

"Used by search engines" - [link](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-pages#keywords)
Used to help devs better find specific content via search.

## Tags

"Another dimension of categorization" - [link](https://docusaurus.io/docs/create-doc#doc-tags)
Used sparingly to help devs see related contact across docs.

## Sidebar

The Aztec docs use a sidebar - https://docusaurus.io/docs/sidebar/items

## Indexing and Search

Algolia docs search - https://docusaurus.io/docs/search#algolia-index-configuration
