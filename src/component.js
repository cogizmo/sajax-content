/**
* Sends an XMLHTTPRequest for the body of an external HTML Document and imports it into the current document at its current position.
*
* @method request
* @param {Object} inOptions
*    @param {String} inOptions.url The url to which the request is sent.
*    @param {String} inOptions.method The HTTP method to use, default is GET.
*    @param {boolean} inOptions.sync By default, all requests are sent asynchronously. To send synchronous requests, set to true.
*    @param {Object} inOptions.params Data to be sent to the server.
*    @param {Object} inOptions.body The content for the request body for POST method.
*    @param {Object} inOptions.headers HTTP request headers.
*    @param {String} inOptions.responseType The response type. Default is 'text'.
*    @param {boolean} inOptions.withCredentials Whether or not to send credentials on the request. Default is false.
*    @param {Object} inOptions.callback Called when request is completed.
* @returns {Object} XHR object.
*/
(function registerComponent() {
    var LOCAL_EVENT = {
            bubbles: false,
            cancelable: false
        },
        PREVENTABLE_EVENT = {
            bubbles: true,
            cancelable: true,
        };

    const _PROPS_ = new WeakMap();
    class SAjaxContent extends Cogizmo {
        static get is() { return 'sajax-content'; }

        constructor() {
            super();

            _PROPS_.set(this, Object.create(null));
        }

        connectedCallback() {
            super.connectedCallback();

            findLiveRegion.call(this);
        }

        disconnectedCallback() {
            super.disconnectedCallback();
        }

        get src() {
            return _PROPS_.get(this).src;
        }

        get auto() {
            return _PROPS_.get(this).auto;
        }

        static get observedAttributes() {
            return ['src', 'when', 'time', 'state', 'initialized', 'auto'];
        }

        attributeChangedCallback(name, old, value) {
        // Feature Check and follow convention
            if ('function' === typeof super.attributeChangedCallback)
                super.attributeChangedCallback(name, old, value);

            switch(name) {
            case "when":
                break;
            case "time":
                this.isTimeToRequest(value, old);
                break;
            case "state":
                break;
            case "initialized":
                break;
            }
        }

    /**
     * Fired after the request is complete, but before the remote body's children have been imported.
     *
     * @event sajax-success
     * @param {NodeList} children The list of nodes contained in the remote body.
     */

    /**
     * Fired after the remote body's children have been imported, but before they have been attached.
     *
     * @event sajax-import
     * @param {NodeList} children The list of nodes imported into the current document.
     */

    /**
     * Fired after the remote body's children have been attached to the node.
     *
     * @event sajax-attach
     * @param {HTMLElement} parentElement The element that the children were attached to.
     */

    // Component Properties
        /**
         * Manually causes an import of the content from the `src` property.
         * Generally, only used when `auto` is `false`.
         */
        transclude() {
            importDocument.call(this);
        }

        initialize(attached) {
            var _auto = this.hasAttribute('auto');
            if (attached && _auto) {
                this.removeAttribute('auto');
                return this._set_auto(true);
            }
            return false;
        }

        onAutoChanged(newValue, oldValue) {
            _PROPS_.get(this).auto = this.hasAttribute('auto');

            if (newValue && this.src && !this.state) {
                loadExternalDocument.call(this);
            }
        }

        onSrcChanged(newValue, oldValue) {
            _PROPS_.get(this).src = newValue;

            if (this._auto && newValue && !this.state) {
                loadExternalDocument.call(this);
            }
        }

        isTimeToRequest(newValue, oldValue) {
            var chk;
            if (this.when > 0 && this.start) {
                chk = newValue - this.start;
                if (chk >= this.when)
                    this.async(loadExternalDocument);
                else if (this.when - chk >= 1000)
                    this.async(updateTime, 1000);
                else this.async(updateTime, this.when-chk);
            }
        }
    }
    SAjaxContent.manage();

// -----------------------------------------------------------------------------
//  Element LifeCycle Functions
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
//  Observed Property Functions
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
//  Element Method Functions
// -----------------------------------------------------------------------------
    function importDocument() {
        if (this.src && !this.state)
            loadExternalDocument.call(this);
    }

// -----------------------------------------------------------------------------
//  Event Listener Functions
// -----------------------------------------------------------------------------
    function onResponse(event) {
    // Remove Event Listener
        //console.log('Recieved Response Event');
        this.removeEventListener('response', onResponse);
    // Check for Error Conditions
        if ('object' !== typeof event.detail)
            throw new TypeError('XMLHTTPRequest did not return a detail object.');
        if (!event.detail)
            throw new TypeError('XMLHTTPRequest does not contain any response data');

        event.detail.text().then(html => {
            return new DOMParser().parseFromString(html, 'text/html');
        })
        .then(doc => {
            document.addEventListener('sajax-success', forwardDefaultAction());
            this.addEventListener('sajax-success', onImportDocument);
            this.dispatchEvent(new CustomEvent('sajax-success', {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: doc.body.children
            }));
        })
    }

    function onImportDocument(event) {
    // This is a default action, must give others the opportunity to preventDefault();
        if (!event.cancelable) {
        // This should only ever fire once.
            this.removeEventListener('sajax-success', onImportDocument);
            var ext,
                ele,
                extBody = event.detail,
                nNodes = extBody.length;

            var rNodes = [];
            for (var i = 0; i < nNodes; i++) {
                ext = extBody[i];
                if ("object" === typeof ext) {
                    ele = importNode(ext);

                    if ("object" === typeof ele) {
                        rNodes.push(ele);
                    }
                }
            }
            document.addEventListener('sajax-import', forwardDefaultAction());
            this.addEventListener('sajax-import', onAttachNodes);

            this.dispatchEvent(new CustomEvent('sajax-import', {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: rNodes
            }))
        }
    }

    function onAttachNodes(event) {
        if (!event.cancelable) {
            var ref, isRefParent,
                p = this.parentElement;
            if (p === null || p === undefined)
                p = this.parentNode.host;

            ref = this.nextElementSibling || p;
            isRefParent = ref === this.parentElement;

            event.detail.forEach(function(node, k, a) {
                if ("object" === typeof node) {
                    try {
                    if (isRefParent)
                        ref.appendChild(node);
                    else if (p)
                        p.insertBefore(node, ref);
                    }
                    catch (ex) {
                        console.log(ex);
                    }
                }
            });

            document.addEventListener('sajax-attach', forwardDefaultAction());
            this.addEventListener('sajax-attach', onRemoveThis);
            this.dispatchEvent(new CustomEvent('sajax-attach', {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: {
                    parent: ref || p,
                    attached: event.detail
                }
            }));
        }
    }

    function onRemoveThis(event) {
        if (!event.cancelable) {
            this.removeEventListener('sajax-attach', onRemoveThis);

            var parent = this.parentElement;
            if (parent === null || parent === undefined) {
                parent = this.parentNode.host;
            }
            if (parent) {
                parent.removeChild(this);
            }
            else ;
        }
    }

// -----------------------------------------------------------------------------
//  PRIVATE ASYNCHRONOUS FUNCTIONS
// -----------------------------------------------------------------------------
    function findLiveRegion() {
        if (this.parentElement !== null) {
            this.parentElement.setAttribute('aria-live', 'polite');
            this.parentElement.setAttribute('aria-busy', 'true');
        }
    }

    function loadExternalDocument() {
        this.state = 'requesting';
        this.addEventListener('response', onResponse);
        fetch(this.src, {
            headers: {
                'Content-Type': 'text/html'
            }
        })
        .then(response => {
            setTimeout(() => {
                this.dispatchEvent(new CustomEvent('response', {
                    bubbles: true,
                    composed: true,
                    cancelable: true,
                    detail: response
                }));
            }, 0);
        });
    }

// -----------------------------------------------------------------------------
//  Private Helper Functions
// -----------------------------------------------------------------------------
    function updateTime() {
        this.time = Date.now();
    }

// -----------------------------------------------------------------------------
//  PRIVATE HELPER FUNCTIONS
// -----------------------------------------------------------------------------
    function bindEventToNode(descriptor) {
        var rDescriptor = descriptor || {};
        rDescriptor.node = this;
        return rDescriptor;
    }

    function makePreventableEvent() {
        return bindEventToNode.call(this, PREVENTABLE_EVENT);
    }

    function forwardDefaultAction() {
        return function handler(event) {
        // Chrome uses srcElement
            var context = event.srcElement || event.originalTarget;
        // IE handing -> srcElement is not the polymer element.
            if (!context || !context.fire) {
                context = event.target;
            // FireFox -> uses originalTarget instead
                if (!context || !context.fire)
                    context = event.originalTarget;
            }

        // Only cancelable events may have their defaultAction canceled.
            if (event.cancelable) {
            // This is a one time forward... for this event only.
                document.removeEventListener(event.type, handler);
                if (!event.defaultPrevented) {
                    let ev = bindEventToNode.call(context, LOCAL_EVENT);
                    ev.detail = event.detail;
                    context.dispatchEvent(new CustomEvent(event.type, ev));
                }
            }
        };
    }

    function importNode(node) {
        var element;
        try {
            element = document.importNode(node, true);
        }
        catch (err) {
            window.lastManualCopy = node.tagName;
            element = manualCopy(node);
        }
        return element;
    }

    function manualCopy(node) {
        var copy = document.createElement(node.tagName);

        var i, n = node.attributes.length, attr;
        for (i = 0; i < n; i++) {
            attr = node.attributes[i];
            copy.setAttribute(attr.nodeName, attr.nodeValue);

            var j, nChildren = node.children.length, child;
            for (j = 0; j < nChildren; j++) {
                node.appendChild(importNode(node.children[j]));
            }
        }
        return copy;
    }

}) ();
