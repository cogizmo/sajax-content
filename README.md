# `<sajax-content>`
Transcludes HTML content from an external HTML resource.

## Usage

Fetch the HTML document and replace itself with the HTML body contents.
```html
<sajax-content src="path/to/external.html" auto></sajax-content>
```

## Installation

`<sajax-content>` is available on [NPM](https://www.npmjs.com/package/@cogizmo/sajax-content) and may be installed as  a dependency.

```
> npm install @cogizmo/sajax-content
```

1. Place the files on your server.

2. Install the appropriate [cogizmo/Cogizmo](https://github.com/cogizmo/cogizmo).
    * From npm
    ```
    > npm install @cogizmo/cogizmo
    ```

    * From github

3. Add Cogizmo to your document `<head>`.

    ```html
    <script src="path/to/Cogizmo.js"></script>
    ```

4. Add `<sajax-content>` element to your document.

    ```html
    <script src="path/to/sajax-content.js"></script>
    ```

6. Use element whereever you want to transclude html.

    ```html
    <sajax-content src="path/to/external.html"></sajax-content>
    ```

## Declarative API (HTML)

### `auto` attribute

`Boolean`

When true, will fetch the external HTML when a valid [src attribute](#src-attribute). When false, will wait until [`auto` attribute](#auto-attribute) is true or [transclude](#transclude()) is called.

`True`:
```html
<sajax-content auto></sajax-content>
```

`False`:
```html
<sajax-content></sajax-content>
```

### `select` attribute

`String<CSSSelector>` = `"*"`

Determines which elements are transcluded from the external HTML document's `<body>`. Valid values are any selector that can be used as an argument for `HTMLElement.querySelectorAll()`. The following gets all `<p>`s that are children of elements with `class="container"`.

```html
<sajax-content select=".container > p"></sajax-content>
```

### `src` attribute

`String` - *Required*

URL pointing to the desired external HTML document. URLs are calculated in relation to the current document.

```html
<sajax-content src="path/to/external.html"></sajax-content>
```

## Imperative API (JS/ES)

### `element.auto`

Returns `Boolean` - *ReadOnly*

When true, will fetch the external HTML when a valid [src attribute](#src-attribute). When false, will wait until [`auto` attribute](#auto-attribute) is true or [transclude](#transclude()) is called.

### `element.select`

Returns `String<CSSSelector>` = `"*"`

Determines which elements are transcluded from the external HTML document's `<body>`. Valid values are any selector that can be used as an argument for `HTMLElement.querySelectorAll()`. The following gets all `<p>`s that are children of elements with `class="container"`.

### `element.src`

Returns `String` - *ReadOnly*

URL pointing to the desired external HTML document. URLs are calculated in relation to the current document.

### `element.transclude()`

Gets an external HTML document from [`src` attribute](), queries the document for the elements using the [`select` attribute](#select), and imports them into the current HTML document.

## DOM Events

`<sajax-content>` events try to behave as close to native DOM as possible. This means that you may cancel `<sajax-content>`s default behavior without having to worry about order of listeners or hierarchy. There is a single limitation to maintain defaultable and cancelable behavior. do not add an event listener to `<sajax-content>` events on the `window/global` object.

### response

Fires when `transclude()` has retrieved a URL successfully.

Detail: The [`response` object](https://developer.mozilla.org/en-US/docs/Web/API/Response) containing the data retrieved by the URL.

### sajax-success

Fires when the transclusion process has successfully retrieved elements from an HTML document.

Detail: The `NodeList` query results from the external HTML document. *The nodes are not yet imported.*

### sajax-import

Fires when the transclusion process has imported the `NodeList` results.

Detail: An `Array` containing the imported nodes.

### sajax-attach

Fires when the transclusion process has attached the imported nodes from the external HTML document.

Detail: An `Array` containing the attached nodes.
