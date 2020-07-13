const template = {"html":"<!DOCTYPE html>\n<html lang=\"en\">\n  <title>Visual Snapshots</title>\n\n  <head>\n    <script>\n      const __images = <%- images %>\n    </script>\n\n    <style>\n      body {\n        margin: 0;\n      }\n\n      .app {\n        display: flex;\n        flex-direction: column;\n        height: 100vh;\n        padding: 0 12px;\n      }\n\n      .snapshots {\n      }\n\n      .header {\n        display: grid;\n        grid-auto-flow: column;\n        justify-content: space-between;\n        align-items: center;\n        grid-gap: 12px;\n\n        position: sticky;\n        top: 0;\n        margin: 0;\n        padding: 12px 0;\n        background-color: white;\n        z-index: 1;\n      }\n\n      .button-bar {\n        display: grid;\n        grid-auto-flow: column;\n        grid-gap: 6px;\n      }\n      .button {\n        cursor: pointer;\n        padding: 6px;\n      }\n      .button.selected {\n        cursor: default;\n        color: white;\n        background-color: black;\n      }\n\n      .button.disabled {\n        cursor: default;\n        opacity: 0.2;\n      }\n\n      .image-wrapper {\n        padding: 12px;\n        background-color: #ccc;\n      }\n\n      .image {\n        max-width: 100%;\n      }\n\n      .top-nav {\n        display: grid;\n        grid-gap: 12px;\n        grid-auto-flow: column;\n      }\n    </style>\n\n    <script type=\"module\">\n      import {\n        html,\n        Component,\n        render,\n      } from 'https://unpkg.com/htm/preact/standalone.module.js';\n\n      const States = ['Diff', 'Original', 'New'];\n      const IMAGE_DIRS = ['diffs', 'original', 'changed', 'new'];\n\n      class App extends Component {\n        state = {\n          images: {},\n        };\n        addTodo() {\n          const {todos = []} = this.state;\n          this.setState({todos: todos.concat(`Item ${todos.length}`)});\n        }\n\n        handleImageLoaded = e => {\n          if (!this.state.width) {\n            this.setState({\n              width: e.target.width,\n            });\n          }\n        };\n\n        navigate(img, direction) {\n          this.setState(state => ({\n            images: {\n              ...state.images,\n              [img]: ((state.images[img] || 0) + direction) % 3,\n            },\n          }));\n        }\n\n        handleSelectState = (img, newViewState) => {\n          this.setState(state => ({\n            images: {\n              ...state.images,\n              [img]: States.indexOf(newViewState),\n            },\n          }));\n        };\n\n        handleImageClick = (img, e) => {\n          this.navigate(img, 1);\n        };\n\n        handleKeyDown = (img, e) => {\n          e.preventDefault();\n          const direction =\n            e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : null;\n          if (!direction) {\n            return null;\n          }\n\n          this.navigate(img, direction);\n        };\n\n        render({page}, {todos = []}) {\n          const added = Object.entries(__images.added);\n          const missing = Object.entries(__images.missing);\n          const changed = Object.entries(__images.changed);\n          const differentSize = Object.entries(__images.differentSize);\n\n          return html`\n            <div class=\"app\">\n              <nav class=\"top-nav\">\n                <h3>\n                  <a href=\"#changed\">Changed (${changed.length})</a>\n                </h3>\n                <h3>\n                  <a href=\"#changed-sizes\"\n                    >Changed (different sizes) (${differentSize.length})</a\n                  >\n                </h3>\n                <h3>\n                  <a href=\"#added\">Added (${added.length})</a>\n                </h3>\n                <h3>\n                  <a href=\"#missing\">Missing (${missing.length})</a>\n                </h3>\n              </nav>\n\n              <h2 id=\"changed\">\n                Changed\n              </h2>\n              <div class=\"snapshots\">\n                ${changed.map(([img, src], i) => {\n                  const typeIndex = this.state.images[img] || 0;\n\n                  return html`\n                    <h3 class=\"header\">\n                      ${img}\n                      <div class=\"button-bar\">\n                        ${States.map(\n                          (state, i) => html`\n                            <button\n                              class=\"${`button${\n                                i === typeIndex ? ' selected' : ''\n                              }`}\"\n                              type=\"button\"\n                              onKeyDown=\"${e => this.handleKeyDown(img, e)}\"\n                              onClick=\"${() =>\n                                this.handleSelectState(img, state)}\"\n                            >\n                              ${state}\n                            </button>\n                          `\n                        )}\n                      </div>\n                    </h3>\n                    <div class=\"image-wrapper\">\n                      <img\n                        tabindex=\"${i}\"\n                        class=\"image\"\n                        key=\"${img}\"\n                        alt=\"${img}\"\n                        src=\"results/${IMAGE_DIRS[typeIndex]}/${src}\"\n                        onLoad=\"${this.handleImageLoaded}\"\n                        onClick=\"${e => this.handleImageClick(img, e)}\"\n                        onKeyDown=\"${e => this.handleKeyDown(img, e)}\"\n                      />\n                    </div>\n                  `;\n                })}\n              </div>\n\n              <h2 id=\"changed-sizes\">\n                Changed (Size changed, diffs unavailable)\n              </h2>\n              <div class=\"snapshots\">\n                ${differentSize.map(([img, src], i) => {\n                  const typeIndex = this.state.images[img] || 2;\n\n                  return html`\n                    <h3 class=\"header\">\n                      ${img}\n                      <div class=\"button-bar\">\n                        ${States.map(\n                          (state, i) => html`\n                            <button\n                              class=\"${`button${\n                                i === typeIndex ? ' selected' : ''\n                              }${state === 'Diff' ? ' disabled' : ''}`}\"\n                              type=\"button\"\n                              onKeyDown=\"${e => this.handleKeyDown(img, e)}\"\n                              onClick=\"${() =>\n                                this.handleSelectState(img, state)}\"\n                            >\n                              ${state}\n                            </button>\n                          `\n                        )}\n                      </div>\n                    </h3>\n                    <div class=\"image-wrapper\">\n                      <img\n                        tabindex=\"${i}\"\n                        class=\"image\"\n                        key=\"${img}\"\n                        alt=\"${img}\"\n                        src=\"results/${IMAGE_DIRS[typeIndex]}/${src}\"\n                        onLoad=\"${this.handleImageLoaded}\"\n                        onClick=\"${e => this.handleImageClick(img, e)}\"\n                        onKeyDown=\"${e => this.handleKeyDown(img, e)}\"\n                      />\n                    </div>\n                  `;\n                })}\n              </div>\n\n              <h2 id=\"added\">\n                Added\n              </h2>\n              <div class=\"snapshots\">\n                ${added.map(([img, src], i) => {\n                  const typeIndex = this.state.images[img] || 0;\n\n                  return html`\n                    <h3 class=\"header\">\n                      ${img}\n                      <div class=\"button-bar\">\n                        ${States.map(\n                          state => html`\n                            <button\n                              class=\"${`button${\n                                state === 'New' ? ' selected' : ''\n                              }${state !== 'New' ? ' disabled' : ''}`}\"\n                              type=\"button\"\n                            >\n                              ${state}\n                            </button>\n                          `\n                        )}\n                      </div>\n                    </h3>\n                    <div class=\"image-wrapper\">\n                      <img\n                        tabindex=\"${i}\"\n                        class=\"image\"\n                        key=\"${img}\"\n                        alt=\"${img}\"\n                        src=\"results/${IMAGE_DIRS[\n                          IMAGE_DIRS.indexOf('new')\n                        ]}/${src}\"\n                      />\n                    </div>\n                  `;\n                })}\n              </div>\n\n              <h2 id=\"missing\">\n                Missing\n              </h2>\n              <div class=\"snapshots\">\n                ${missing.map(([img, src], i) => {\n                  const typeIndex = this.state.images[img] || 0;\n\n                  return html`\n                    <h3 class=\"header\">\n                      ${img}\n                      <div class=\"button-bar\">\n                        ${States.map(\n                          state => html`\n                            <button\n                              class=\"${`button${\n                                state === 'Original' ? ' selected' : ''\n                              }${state !== 'Original' ? ' disabled' : ''}`}\"\n                              type=\"button\"\n                            >\n                              ${state}\n                            </button>\n                          `\n                        )}\n                      </div>\n                    </h3>\n                    <div class=\"image-wrapper\">\n                      <img\n                        tabindex=\"${i}\"\n                        class=\"image\"\n                        key=\"${img}\"\n                        alt=\"${img}\"\n                        src=\"results/${IMAGE_DIRS[\n                          IMAGE_DIRS.indexOf('original')\n                        ]}/${src}\"\n                      />\n                    </div>\n                  `;\n                })}\n              </div>\n            </div>\n          `;\n        }\n      }\n\n      const Header = ({name}) =>\n        html`\n          <h1>${name}</h1>\n        `;\n\n      const Footer = props =>\n        html`\n          <footer ...${props} />\n        `;\n\n      render(\n        html`\n          <${App} page=\"All\" />\n        `,\n        document.body\n      );\n    </script>\n  </head>\n\n  <body></body>\n</html>\n"}; export default template