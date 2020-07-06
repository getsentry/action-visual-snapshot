const template = {
  html:
    '<!DOCTYPE html>\n<html lang="en">\n  <title>Visual Snapshots</title>\n\n  <head>\n    <script>\n      const __images = <%- images %>\n    </script>\n\n    <style>\n      body {\n        margin: 0;\n      }\n\n      .app {\n        display: flex;\n        flex-direction: column;\n        height: 100vh;\n        padding: 0 12px;\n      }\n\n      .snapshots {\n      }\n\n      .header {\n        display: grid;\n        grid-auto-flow: column;\n        justify-content: space-between;\n        align-items: center;\n        grid-gap: 12px;\n\n        position: sticky;\n        top: 0;\n        margin: 0;\n        padding: 12px 0;\n        background-color: white;\n        z-index: 1;\n      }\n\n      .button-bar {\n        display: grid;\n        grid-auto-flow: column;\n        grid-gap: 6px;\n      }\n      .button {\n        padding: 6px;\n      }\n      .button.selected {\n        color: white;\n        background-color: black;\n      }\n\n      .img {\n        overflow: hidden;\n        max-width: 100%;\n      }\n      .image {\n        max-width: 300%;\n      }\n    </style>\n\n    <script type="module">\n      import {\n        html,\n        Component,\n        render,\n      } from \'https://unpkg.com/htm/preact/standalone.module.js\';\n\n      const States = [\'Original\', \'New\', \'Diff\'];\n\n      class App extends Component {\n        state = {\n          images: {},\n        };\n        componentDidMount() {\n          console.log(\'mount\');\n        }\n        addTodo() {\n          const {todos = []} = this.state;\n          this.setState({todos: todos.concat(`Item ${todos.length}`)});\n        }\n\n        handleImageLoaded = e => {\n          console.log(\'loaded\', e.target.width);\n          if (!this.state.width) {\n            this.setState({\n              width: e.target.width / 3,\n            });\n          }\n        };\n\n        navigate(img, direction) {\n          this.setState(state => ({\n            images: {\n              ...state.images,\n              [img]: ((state.images[img] || 0) + direction) % 3,\n            },\n          }));\n        }\n\n        handleSelectState = (img, newViewState) => {\n          this.setState(state => ({\n            images: {\n              ...state.images,\n              [img]: States.indexOf(newViewState),\n            },\n          }));\n        };\n\n        handleImageClick = (img, e) => {\n          this.navigate(img, 1);\n        };\n\n        handleKeyDown = (img, e) => {\n          e.preventDefault();\n          const direction =\n            e.key === \'ArrowRight\' ? 1 : e.key === \'ArrowLeft\' ? -1 : null;\n          if (!direction) {\n            return null;\n          }\n\n          this.navigate(img, direction);\n        };\n\n        render({page}, {todos = []}) {\n          return html`\n            <div class="app">\n              <div class="snapshots">\n                ${Object.entries(__images.changed).map(\n                  ([img, src], i) => html`\n                    <h3 class="header">\n                      ${img}\n                      <div class="button-bar">\n                        ${States.map(\n                          (state, i) => html`\n                            <button\n                              class="${`button${\n                                i === (this.state.images[img] || 0)\n                                  ? \' selected\'\n                                  : \'\'\n                              }`}"\n                              type="button"\n                              onKeyDown="${e => this.handleKeyDown(img, e)}"\n                              onClick="${() =>\n                                this.handleSelectState(img, state)}"\n                            >\n                              ${state}\n                            </button>\n                          `\n                        )}\n                      </div>\n                    </h3>\n                    <div\n                      class="img"\n                      style="${{\n                        maxWidth: `${this.state.width}px`,\n                      }}"\n                    >\n                      <img\n                        tabindex="${i}"\n                        class="image"\n                        key="${img}"\n                        alt="${img}"\n                        src="diffs/${src}"\n                        style="${{\n                          transform: `translateX(${(this.state.images[img] ||\n                            0) * -33.33}%)`,\n                        }}"\n                        onLoad="${this.handleImageLoaded}"\n                        onClick="${e => this.handleImageClick(img, e)}"\n                        onKeyDown="${e => this.handleKeyDown(img, e)}"\n                      />\n                    </div>\n                  `\n                )}\n              </div>\n            </div>\n          `;\n        }\n      }\n\n      const Header = ({name}) =>\n        html`\n          <h1>${name}</h1>\n        `;\n\n      const Footer = props =>\n        html`\n          <footer ...${props} />\n        `;\n\n      render(\n        html`\n          <${App} page="All" />\n        `,\n        document.body\n      );\n    </script>\n  </head>\n\n  <body></body>\n</html>\n',
};
export default template;
