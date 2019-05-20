<template>
    <div class="content-container">
        <div class="columns is-gapless">
            <div class="column is-half">
                <section class="editor-container">
                    <div class="editor-workspace">
                        <textarea ref="editor"></textarea>
                    </div>
                    <footer class="editor-footer"></footer>
                </section>
            </div>
            <div class="column is-half">
                <section class="template-preview">
                    <div class="p-t-base p-b-base">
                        <div class="columns is-centered">
                            <div class="column is-1 has-text-right">
                                <b-tooltip label="Desktop view" position="is-bottom" type="is-dark">
                                    <span class="responsive"
                                        :class="{'is-selected': responsiveClass === ''}"
                                        @click="responsiveClass = ''">
                                            <i class="fas fa-desktop has-text-grey-dark"></i>
                                    </span>
                                </b-tooltip>
                            </div>
                            <div class="column is-1 has-text-centered">
                                <b-tooltip label="Tablet view" position="is-bottom" type="is-dark">
                                    <span class="responsive"
                                        :class="{'is-selected': responsiveClass === 'is-tablet'}"
                                        @click="responsiveClass = 'is-tablet'">
                                            <i class="fas fa-tablet-alt has-text-grey-dark"></i>
                                    </span>
                                </b-tooltip>
                            </div>
                            <div class="column is-1 has-text-left">
                                <b-tooltip label="Mobile view" position="is-bottom" type="is-dark">
                                    <span class="responsive"
                                        :class="{'is-selected': responsiveClass === 'is-mobile'}"
                                        @click="responsiveClass = 'is-mobile'">
                                            <i class="fas fa-mobile-alt has-text-grey-dark"></i>
                                    </span>
                                </b-tooltip>
                            </div>
                        </div>
                    </div>
                    <div class="continue-button">
                        <a class="button is-text has-text-warning">MJML</a>
                        <a href="#" class="button is-warning" @click="" :disabled="$v.$invalid">HTML</a>
                    </div>
                    <iframe class="is-fullhd" ref="preview" :class="responsiveClass"></iframe>
                </section>
            </div>
        </div>
        <!-- <b-modal :active.sync="isImageUploadModalActive">
            <div class="card image-upload">
                <file-pond name="image" ref="pond"
                    label-idle="Click to upload or drop files here..."
                    allow-multiple="false"
                    @init="handleFilePondInit"
                    @processfile="fileProcessed"
                    accepted-file-types="image/jpeg, image/png"
                    labelFileTypeNotAllowed="Only images are allowed"
                    allowFileSizeValidation="true"
                    maxFileSize="3MB"
                    labelMaxFileSizeExceeded="This image is too large"
                    labelMaxFileSize="Maximum file size is 3MB" />
            </div>
        </b-modal> -->
    </div>
</template>
</<script>
import SimpleMDE from 'simplemde'
import _debounce from 'lodash/debounce'
import markdownit from 'markdown-it'
import collect from 'collect.js'
import { required } from 'vuelidate/lib/validators'
import vueFilePond from 'vue-filepond'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import FilePondPluginValidateFileType from 'filepond-plugin-file-validate-type'
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size'
import Mustache from 'mustache'

// Import uploader styles
import 'filepond/dist/filepond.min.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css'

const FilePond = vueFilePond(FilePondPluginImagePreview, FilePondPluginValidateFileType, FilePondPluginFileValidateSize)

export default {
    name: 'Editor',
    components: {
        FilePond
    },
    data() {
        return {
            editor: null,
            toolbar: null,
            statusbar: null,
            footer: null,
            preview: null,
            markdown: null,
            mjml: null,
            message: null,
            responsiveClass: '',
            isImageUploadModalActive: false,
            imageInsertSelection: null,
            template: null
        }
    },
    validations: {
        markdown: { required }
    },
    watch: {
        // isImageUploadModalActive(newVal, oldVal) {
        //     if (newVal) {
        //         // Grab the selection for the editor
        //         this.imageInsertSelection = {
        //             anchor: this.editor.codemirror.getCursor('anchor'),
        //             head: this.editor.codemirror.getCursor('head')
        //         }
        //     } else {
        //         this.imageInsertSelection = null
        //     }
        // }
    },
    methods: {
        getStartingTemplate() {
            return `<mjml>
    <mj-head>
        <mj-preview>{{ preview }}</mj-preview>
        <mj-attributes>
            <mj-all font-family="Georgia, Times New Roman, Courier" line-height="1.6" color="#2c3e50" font-size="16px"></mj-all>
            <mj-divider border-width="1px" border-style="solid" border-color="lightgrey" padding="25px 0" />
        </mj-attributes>
        <mj-style>a, a:visited { color: #151315; }</mj-style>
    </mj-head>
    <mj-body background-color="#f5f4f6">
        <mj-section padding-bottom="0px" background-color="#f5f4f6">
            <mj-column width="100%">
                <mj-spacer height="45px"></mj-spacer>
            </mj-column>
        </mj-section>
        <mj-section background-color="#fefefe" border="1px solid #dfdfdf">
            <mj-column width="100%">{{{ content }}}</mj-column>
        </mj-section>
        <mj-section padding-bottom="0px" background-color="#f5f4f6">
            <mj-column width="100%">
                <mj-spacer height="45px"></mj-spacer>
            </mj-column>
        </mj-section>
    </mj-body>
</mjml>`
        },
        getTemplateOptions() {
            return {
                "content": {
                    "h1": {"font-size": "68px"},
                    "h2": {"font-size": "42px"},
                    "h3": {"font-size": "26px"},
                    "h4": {"font-size": "18px"},
                    "h5": {"font-size": "16px"},
                    "h6": {"font-size": "16px"},
                    "blockquote": {
                        "color": "#767c82",
                        "padding": "25px 45px",
                        "font-size": "18px",
                        "font-style": "italic",
                        "border-left": "5px solid #767c82",
                        "font-family": "Helvetica",
                        "font-weight": "200",
                        "background-color": "#F7F7F7"
                    }
                }
            }
        },
        handleFilePondInit() {
            this.$refs.pond._pond.setOptions({
                server: {
                    url: '',
                    process: {
                        // headers: {
                        //     'Authorization': `Bearer ${window.Auth.getAccessToken()}`
                        // },
                        onload: (imageUrl) => {
                            return imageUrl
                        }
                    },
                    revert: null,
                    restore: null,
                    load: null,
                    fetch: null
                }
            });
        },
        fileProcessed(error, file) {
            this.addMarkdownImage(file)

            // Hide modal
            this.isImageUploadModalActive = false
        },
        addMarkdownImage(file) {
            let cm = this.editor.codemirror
            let url = file.serverId
            let alt = file.filenameWithoutExtension
            let text = `![${alt}](${url})`

            // clicking the image toolbar button will lose the selection so we use
            // the captured selection to re-select here
            if (this._imageInsertSelection) {
                // we want to focus but not re-position
                this.focusEditor()

                // re-select and clear the captured selection so drag/drop still
                // inserts at the correct place
                cm.setSelection(
                    this.imageInsertSelection.anchor,
                    this.imageInsertSelection.head
                );
                this.imageInsertSelection = null;
            }

            // focus editor and place cursor at end if not already focused
            if (cm.hasFocus() === false) {
                this.focusEditor()
                text = `\n\n${text}\n\n`;
            }

            // insert at cursor or replace selection then position cursor at end
            // of inserted text
            cm.replaceSelection(text, 'end');
        },
        focusEditor(position = 'bottom') {
            this.editor.codemirror.focus()

            if (position === 'bottom') {
                this.editor.codemirror.execCommand('goDocEnd')
            } else if (position === 'top') {
                this.editor.codemirror.execCommand('goDocStart')
            }
            return false;
        },
        saveAndContinue() {
            if (this.$v.$invalid) {
                return
            }
            let params = {
                markdown: this.markdown,
                mjml: this.mjml
            }

            // window.BurstsApi.updateMessage(this.$route.params.uuid, params).then(({ data }) => {
            //     if (data.status === 'success') {
            //         this.$router.push('/people/' + data.message.uuid)
            //     }
            // })
        }
    },
    created() {
        // window.BurstsApi.getMessage(this.$route.params.uuid).then(({ data }) => {
        //     this.message = data.message
        //     this.template = data.message.template
        // }).then(() => {
        //     if (this.message.markdown !== null) {
        //         this.editor.value(this.message.markdown)
        //         this.focusEditor()
        //     }
        // })

        this.template = {
            mjml: this.getStartingTemplate(),
            options: this.getTemplateOptions()
        }
    },
    mounted() {
        let toolbarOptions = [
            'bold', 'italic', 'heading', '|',
            'quote', 'unordered-list', 'ordered-list', 'horizontal-rule', '|',
            'link',
            {
                name: 'image',
                action: () => {
                    this.isImageUploadModalActive = true
                },
                className: 'fa fa-picture-o',
                title: 'Upload Image(s)'
            },
            '|', 'guide'
        ]

        this.editor = new SimpleMDE({
            element: this.$refs.editor,
            tabSize: 4,
            lineWrapping: true,
            autofocus: true,
            indentWithTabs: false,
            status: [ 'words' ],
            toolbar: toolbarOptions,
            placeholder: "Start here.\n\n- What projects did you work on last week?\n- What did you ship to customers?\n- What are you doing this week?\n\n\nWrite about the main things your stakeholders ask about",
            parsingConfig: {
                allowAtxHeaderWithoutSpace: true,
                strikethrough: false,
                underscoresBreakWords: true,
            },
            shortcuts: {
                toggleFullScreen: null,
                togglePreview: null,
                toggleSideBySide: null,
                drawImage: null
            }
        })

        this.editor.codemirror.setOption('dragDrop', false)
        this.editor.codemirror.setOption('mode', 'gfm')

        // Move the toolbar and statusbar to the bottom of the editor
        this.toolbar = this.$el.querySelector('.editor-toolbar')
        this.statusbar = this.$el.querySelector('.editor-statusbar')
        this.footer = this.$el.querySelector('.editor-footer')

        this.footer.appendChild(this.toolbar)
        this.footer.appendChild(this.statusbar)

        let iframe = this.$refs.preview
        iframe = iframe.contentWindow || ( iframe.contentDocument.document || iframe.contentDocument)
        this.$refs.preview = iframe
        let _vueSelf = this

        this.focusEditor()

        let mjmlText = function mjmlText(md) {
            md.renderer.rules.paragraph_open = (tokens, idx, options, env, self) => {
                let imageAttributes = {}
                let mjTag = tokens[idx + 1].children.reduce(function (acc, token) {
                    switch (token.type) {
                        case 'image':
                            collect(token.attrs).first((property, index) => {
                                imageAttributes[property[0]] = property[1] // image src
                            })
                            imageAttributes.alt = token.content // Alt text lives here for some reason
                            // No need for the <img> tag anymore but just hide it for images
                            tokens[idx+1].children[0].hidden = true
                            collect(imageAttributes).each((value, attr) => {
                                tokens[idx].attrPush([attr, value])
                            })
                            return 'mj-image'
                        case 'text':
                        default:
                            return 'mj-text'
                    }
                }, 'text')
                tokens[idx].tag = mjTag
                return self.renderToken(tokens, idx, options, env, self)
            }

            md.renderer.rules.paragraph_close = (tokens, idx, options, env, self) => {
                // Switch between image and text tags for paragraphs
                tokens[idx].tag = tokens[idx - 1].children.reduce(function (acc, token) {
                    switch (token.type) {
                        case 'image':
                            return 'mj-image'
                        case 'text':
                        default:
                            return 'mj-text'
                    }
                }, 'text')
                return self.renderToken(tokens, idx, options, env, self)
            }

            md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
                // Push the heading styles based on the tag (h1,h2,h3,h4,h5,h6)
                collect(_vueSelf.template.options.content[tokens[idx].tag]).each((value, attr) => {
                    tokens[idx].attrPush([attr, value])
                })

                tokens[idx].tag = 'mj-text'
                return self.renderToken(tokens, idx, options, env, self)
            }

            md.renderer.rules.heading_close = (tokens, idx, options, env, self) => {
                return `</mj-text>`
            }

            md.renderer.rules.bullet_list_open = (tokens, idx, options, env, self) => {
                return `<mj-text><ul>`
            }

            md.renderer.rules.bullet_list_close = (tokens, idx, options, env, self) => {
                return `</ul></mj-text>`
            }

            md.renderer.rules.ordered_list_open = (tokens, idx, options, env, self) => {
                return `<mj-text><ol>`
            }

            md.renderer.rules.ordered_list_close = (tokens, idx, options, env, self) => {
                return `</ol></mj-text>`
            }

            md.renderer.rules.blockquote_open = (tokens, idx, options, env, self) => {
                let blockQuoteStyles = ''
                collect(_vueSelf.template.options.content['blockquote']).each((value, attr) => {
                    blockQuoteStyles += `${attr}:${value};`
                })

                // Hide the inline paragraph here
                tokens[idx+1].hidden = true
                return `<mj-text><blockquote style="${blockQuoteStyles}">`
            }

            md.renderer.rules.blockquote_close = (tokens, idx, options, env, self) => {
                return `</blockquote></mj-text>`
            }

            md.renderer.rules.hr = (tokens, idx, options, env, self) => {
                return `<mj-divider />`
            }
        }

        let md = markdownit({ html: true, xhtmlOut: false, breaks: true, linkify: true, typographer: true })
            .use(mjmlText)

        this.editor.codemirror.on('change', _debounce(() => {
            this.markdown = this.editor.value()

            // Render the template
            let mjml = Mustache.render(this.template.mjml, {
                preview: "Test Subject", // The html preview you see in gmail
                content: md.render(this.markdown) // The rest of the content
            })

            // The message needs to store the full mjml so we do not need to reparse the markdown on the server side
            this.mjml = mjml

            // Renders the preview of the mjml
            window.BurstsMjmlApi.render({ mjml: mjml }).then(({data}) => {
                this.$refs.preview.document.open()
                this.$refs.preview.document.write(data.html)
                this.$refs.preview.document.close()
            })
        }, 1000));
    }
}
</script>
