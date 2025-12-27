function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const Editor = {
    config: {
        debounceDelay: 300,
        mathJaxProcessing: false,
        localStorageKey: 'markdownEditorContent',
        autosaveInterval: 5000,
    },
    state: {
        currentMathEngine: 'katex',
        currentMarkdownEngine: 'markdown-it',
        customCssVisible: false,
        lastText: '',
        lastRenderedHTML: '',
        mathJaxRunning: false,
        libsReady: {
            mathJax: false,
            katex: false,
            mermaid: false,
            hljs: false,
            markdownIt: false,
            marked: false
        },
        isInitialized: false,
        mathPlaceholders: {},
        isMobileView: false,
        currentMobilePane: 'editor',
        lastSavedTime: null,
    },
    elements: {
        textarea: null,
        previewContent: null,
        previewPane: null,
        toolbar: null,
        markdownItBtn: null,
        markedBtn: null,
        mathJaxBtn: null,
        kaTeXBtn: null,
        downloadBtn: null,
        downloadPdfBtn: null,
        downloadMdBtn: null,
        downloadTxtBtn: null,
        toggleCssBtn: null,
        customCssContainer: null,
        applyCssBtn: null,
        closeCssBtn: null,
        resetCssBtn: null,
        customStyleTag: null,
        buffer: null,
        showEditorBtn: null,
        showPreviewBtn: null,
        autosaveIndicator: null,
        fontFamilySelect: null,
        fontSearchInput: null,
        fontSizeInput: null,
        textColorInput: null,
        boldColorInput: null,
        italicColorInput: null,
        headingColorInput: null,
        showHeadingBorderCheckbox: null,
        headingBorderColorInput: null,
        headingBorderColorGroup: null,
        linkColorInput: null,
        bgColorInput: null,
        codeTextColorInput: null,
        codeBgColorInput: null,
        lineHeightInput: null,
    },
    markdownItInstance: null,
    markedInstance: null,
    debouncedUpdate: null,
    autosaveTimer: null,
    googleFonts: [
        'ABeeZee', 'Abel', 'Abril Fatface', 'Aclonica', 'Acme', 'Actor', 'Adamina', 'Advent Pro', 'Aguafina Script', 'Akronim', 'Aladin', 'Aldrich', 'Alef', 'Alegreya', 'Alegreya SC', 'Alegreya Sans', 'Alegreya Sans SC', 'Alex Brush', 'Alfa Slab One', 'Alice', 'Alike', 'Alike Angular', 'Allan', 'Allerta', 'Allerta Stencil', 'Allura', 'Almendra', 'Almendra Display', 'Almendra SC', 'Amarante', 'Amaranth', 'Amatic SC', 'Amethysta', 'Amiri', 'Amita', 'Anaheim', 'Andada', 'Andika', 'Angkor', 'Annie Use Your Telescope', 'Anonymous Pro', 'Antic', 'Antic Didone', 'Antic Slab', 'Anton', 'Arapey', 'Arbutus', 'Arbutus Slab', 'Architects Daughter', 'Archivo', 'Archivo Black', 'Archivo Narrow', 'Arimo', 'Arizonia', 'Armata', 'Arsenal', 'Artifika', 'Arvo', 'Arya', 'Asap', 'Asap Condensed', 'Asar', 'Asset', 'Assistant', 'Astloch', 'Asul', 'Athiti', 'Atma', 'Atomic Age', 'Aubrey', 'Audiowide', 'Autour One', 'Average', 'Average Sans', 'Averia Gruesa Libre', 'Averia Libre', 'Averia Sans Libre', 'Averia Serif Libre', 'Bad Script', 'Bahiana', 'Baloo', 'Baloo Bhai', 'Baloo Bhaina', 'Baloo Chettan', 'Baloo Da', 'Baloo Paaji', 'Baloo Tamma', 'Baloo Tammudu', 'Baloo Thambi', 'Balthazar', 'Bangers', 'Barlow', 'Barlow Condensed', 'Barlow Semi Condensed', 'Barriecito', 'Barrio', 'Basic', 'Battambang', 'Baumans', 'Bayon', 'Belgrano', 'Belleza', 'BenchNine', 'Bentham', 'Berkshire Swash', 'Bevan', 'Bigelow Rules', 'Bigshot One', 'Bilbo', 'Bilbo Swash Caps', 'BioRhyme', 'BioRhyme Expanded', 'Biryani', 'Bitter', 'Black Han Sans', 'Black Ops One', 'Bokor', 'Bonbon', 'Boogaloo', 'Bowlby One', 'Bowlby One SC', 'Brawler', 'Bree Serif', 'Bubblegum Sans', 'Bubbler One', 'Buda', 'Buenard', 'Bungee', 'Bungee Hairline', 'Bungee Inline', 'Bungee Outline', 'Bungee Shade', 'Butcherman', 'Butterfly Kids', 'Cabin', 'Cabin Condensed', 'Cabin Sketch', 'Caesar Dressing', 'Cagliostro', 'Cairo', 'Calligraffitti', 'Cambay', 'Cambo', 'Candal', 'Cantarell', 'Cantata One', 'Cantora One', 'Capriola', 'Cardo', 'Carme', 'Carrois Gothic', 'Carrois Gothic SC', 'Carter One', 'Catamaran', 'Caudex', 'Caveat', 'Caveat Brush', 'Cedarville Cursive', 'Ceviche One', 'Changa', 'Changa One', 'Chango', 'Chathura', 'Chau Philomene One', 'Chela One', 'Chelsea Market', 'Chenla', 'Cherry Cream Soda', 'Cherry Swash', 'Chewy', 'Chicle', 'Chivo', 'Chonburi', 'Cinzel', 'Cinzel Decorative', 'Clicker Script', 'Coda', 'Coda Caption', 'Codystar', 'Coiny', 'Combo', 'Comfortaa', 'Coming Soon', 'Concert One', 'Condiment', 'Content', 'Contrail One', 'Convergence', 'Cookie', 'Copse', 'Corben', 'Cormorant', 'Cormorant Garamond', 'Cormorant Infant', 'Cormorant SC', 'Cormorant Unicase', 'Cormorant Upright', 'Courgette', 'Cousine', 'Coustard', 'Covered By Your Grace', 'Crafty Girls', 'Creepster', 'Crete Round', 'Crimson Text', 'Croissant One', 'Crushed', 'Cuprum', 'Cute Font', 'Cutive', 'Cutive Mono', 'Damion', 'Dancing Script', 'Dangrek', 'David Libre', 'Dawning of a New Day', 'Days One', 'Dekko', 'Delius', 'Delius Swash Caps', 'Delius Unicase', 'Della Respira', 'Denk One', 'Devonshire', 'Dhurjati', 'Didact Gothic', 'Diplomata', 'Diplomata SC', 'Domine', 'Donegal One', 'Doppio One', 'Dorsa', 'Dosis', 'Dr Sugiyama', 'Droid Sans', 'Droid Sans Mono', 'Droid Serif', 'Duru Sans', 'Dynalight', 'EB Garamond', 'Eagle Lake', 'Eater', 'Economica', 'Eczar', 'El Messiri', 'Electrolize', 'Elsie', 'Elsie Swash Caps', 'Emblema One', 'Emilys Candy', 'Encode Sans', 'Encode Sans Condensed', 'Encode Sans Expanded', 'Encode Sans Semi Condensed', 'Encode Sans Semi Expanded', 'Engagement', 'Englebert', 'Enriqueta', 'Erica One', 'Esteban', 'Euphoria Script', 'Ewert', 'Exo', 'Exo 2', 'Expletus Sans', 'Fanwood Text', 'Farsan', 'Fascinate', 'Fascinate Inline', 'Faster One', 'Fasthand', 'Fauna One', 'Faustina', 'Federant', 'Federo', 'Felipa', 'Fenix', 'Finger Paint', 'Fira Mono', 'Fira Sans', 'Fira Sans Condensed', 'Fira Sans Extra Condensed', 'Fjalla One', 'Fjord One', 'Flamenco', 'Flavors', 'Fondamento', 'Fontdiner Swanky', 'Forum', 'Francois One', 'Frank Ruhl Libre', 'Freckle Face', 'Fredericka the Great', 'Fredoka One', 'Freehand', 'Fresca', 'Frijole', 'Fruktur', 'Fugaz One', 'GFS Didot', 'GFS Neohellenic', 'Gabriela', 'Gafata', 'Galada', 'Galdeano', 'Galindo', 'Gentium Basic', 'Gentium Book Basic', 'Geo', 'Geostar', 'Geostar Fill', 'Germania One', 'Gidugu', 'Gilda Display', 'Give You Glory', 'Glass Antiqua', 'Glegoo', 'Gloria Hallelujah', 'Goblin One', 'Gochi Hand', 'Gorditas', 'Goudy Bookletter 1911', 'Graduate', 'Grand Hotel', 'Gravitas One', 'Great Vibes', 'Griffy', 'Gruppo', 'Gudea', 'Gurajada', 'Habibi', 'Halant', 'Hammersmith One', 'Hanalei', 'Hanalei Fill', 'Handlee', 'Hanuman', 'Happy Monkey', 'Harmattan', 'Headland One', 'Heebo', 'Henny Penny', 'Herr Von Muellerhoff', 'Hind', 'Hind Guntur', 'Hind Madurai', 'Hind Siliguri', 'Hind Vadodara', 'Holtwood One SC', 'Homemade Apple', 'Homenaje', 'IM Fell DW Pica', 'IM Fell DW Pica SC', 'IM Fell Double Pica', 'IM Fell Double Pica SC', 'IM Fell English', 'IM Fell English SC', 'IM Fell French Canon', 'IM Fell French Canon SC', 'IM Fell Great Primer', 'IM Fell Great Primer SC', 'Iceberg', 'Iceland', 'Imprima', 'Inconsolata', 'Inder', 'Indie Flower', 'Inika', 'Inknut Antiqua', 'Inter', 'Irish Grover', 'Istok Web', 'Italiana', 'Italianno', 'Itim', 'Jacques Francois', 'Jacques Francois Shadow', 'Jaldi', 'Jim Nightshade', 'Jockey One', 'Jolly Lodger', 'Jomhuria', 'Josefin Sans', 'Josefin Slab', 'Joti One', 'Judson', 'Julee', 'Julius Sans One', 'Junge', 'Jura', 'Just Another Hand', 'Just Me Again Down Here', 'Kadwa', 'Kalam', 'Kameron', 'Kanit', 'Kantumruy', 'Karla', 'Karma', 'Katibeh', 'Kaushan Script', 'Kavivanar', 'Kavoon', 'Kdam Thmor', 'Keania One', 'Kelly Slab', 'Kenia', 'Khand', 'Khmer', 'Khula', 'Kite One', 'Knewave', 'Kotta One', 'Koulen', 'Kranky', 'Kreon', 'Kristi', 'Krona One', 'Kumar One', 'Kumar One Outline', 'Kurale', 'La Belle Aurore', 'Laila', 'Lakki Reddy', 'Lalezar', 'Lancelot', 'Lateef', 'Lato', 'League Script', 'Leckerli One', 'Ledger', 'Lekton', 'Lemon', 'Lemonada', 'Libre Baskerville', 'Libre Barcode 128', 'Libre Barcode 128 Text', 'Libre Barcode 39', 'Libre Barcode 39 Extended', 'Libre Barcode 39 Extended Text', 'Libre Barcode 39 Text', 'Libre Franklin', 'Life Savers', 'Lilita One', 'Lily Script One', 'Limelight', 'Linden Hill', 'Lobster', 'Lobster Two', 'Londrina Outline', 'Londrina Shadow', 'Londrina Sketch', 'Londrina Solid', 'Lora', 'Love Ya Like A Sister', 'Loved by the King', 'Lovers Quarrel', 'Luckiest Guy', 'Lusitana', 'Lustria', 'Macondo', 'Macondo Swash Caps', 'Mada', 'Magra', 'Maiden Orange', 'Maitree', 'Mako', 'Mallanna', 'Mandali', 'Manuale', 'Marcellus', 'Marcellus SC', 'Marck Script', 'Margarine', 'Marko One', 'Marmelad', 'Martel', 'Martel Sans', 'Marvel', 'Mate', 'Mate SC', 'Maven Pro', 'McLaren', 'Meddon', 'MedievalSharp', 'Medula One', 'Meera Inimai', 'Megrim', 'Meie Script', 'Merienda', 'Merienda One', 'Merriweather', 'Merriweather Sans', 'Metal', 'Metal Mania', 'Metamorphous', 'Metrophobic', 'Michroma', 'Milonga', 'Miltonian', 'Miltonian Tattoo', 'Miniver', 'Miriam Libre', 'Mirza', 'Miss Fajardose', 'Mitr', 'Modak', 'Modern Antiqua', 'Mogra', 'Molengo', 'Molle', 'Monda', 'Monofett', 'Monoton', 'Monsieur La Doulaise', 'Montaga', 'Montez', 'Montserrat', 'Montserrat Alternates', 'Montserrat Subrayada', 'Moul', 'Moulpali', 'Mountains of Christmas', 'Mouse Memoirs', 'Mr Bedfort', 'Mr Dafoe', 'Mr De Haviland', 'Mrs Saint Delafield', 'Mrs Sheppards', 'Mukta', 'Mukta Mahee', 'Mukta Malar', 'Mukta Vaani', 'Muli', 'Mystery Quest', 'NTR', 'Neucha', 'Neuton', 'New Rocker', 'News Cycle', 'Niconne', 'Nixie One', 'Nobile', 'Nokora', 'Norican', 'Nosifer', 'Nothing You Could Do', 'Noticia Text', 'Noto Sans', 'Noto Serif', 'Nova Cut', 'Nova Flat', 'Nova Mono', 'Nova Oval', 'Nova Round', 'Nova Script', 'Nova Slim', 'Nova Square', 'Numans', 'Nunito', 'Nunito Sans', 'Odor Mean Chey', 'Offside', 'Old Standard TT', 'Oldenburg', 'Oleo Script', 'Oleo Script Swash Caps', 'Open Sans', 'Open Sans Condensed', 'Oranienbaum', 'Orbitron', 'Oregano', 'Orienta', 'Original Surfer', 'Oswald', 'Over the Rainbow', 'Overlock', 'Overlock SC', 'Overpass', 'Overpass Mono', 'Ovo', 'Oxygen', 'Oxygen Mono', 'PT Mono', 'PT Sans', 'PT Sans Caption', 'PT Sans Narrow', 'PT Serif', 'PT Serif Caption', 'Pacifico', 'Padauk', 'Palanquin', 'Palanquin Dark', 'Pangolin', 'Paprika', 'Parisienne', 'Passero One', 'Passion One', 'Pathway Gothic One', 'Patrick Hand', 'Patrick Hand SC', 'Pattaya', 'Patua One', 'Pavanam', 'Paytone One', 'Peddana', 'Peralta', 'Permanent Marker', 'Petit Formal Script', 'Petrona', 'Philosopher', 'Piedra', 'Pinyon Script', 'Pirata One', 'Plaster', 'Play', 'Playball', 'Playfair Display', 'Playfair Display SC', 'Podkova', 'Poiret One', 'Poller One', 'Poly', 'Pompiere', 'Pontano Sans', 'Poppins', 'Port Lligat Sans', 'Port Lligat Slab', 'Pragati Narrow', 'Prata', 'Preahvihear', 'Press Start 2P', 'Pridi', 'Princess Sofia', 'Prociono', 'Prompt', 'Prosto One', 'Proza Libre', 'Puritan', 'Purple Purse', 'Quando', 'Quantico', 'Quattrocento', 'Quattrocento Sans', 'Questrial', 'Quicksand', 'Quintessential', 'Qwigley', 'Racing Sans One', 'Radley', 'Rajdhani', 'Rakkas', 'Raleway', 'Raleway Dots', 'Ramabhadra', 'Ramaraja', 'Rambla', 'Rammetto One', 'Ranchers', 'Rancho', 'Ranga', 'Rasa', 'Rationale', 'Ravi Prakash', 'Redressed', 'Reem Kufi', 'Reenie Beanie', 'Revalia', 'Rhodium Libre', 'Ribeye', 'Ribeye Marrow', 'Righteous', 'Risque', 'Roboto', 'Roboto Condensed', 'Roboto Mono', 'Roboto Slab', 'Rochester', 'Rock Salt', 'Rokkitt', 'Romanesco', 'Ropa Sans', 'Rosario', 'Rosarivo', 'Rouge Script', 'Rozha One', 'Rubik', 'Rubik Mono One', 'Ruda', 'Rufina', 'Ruge Boogie', 'Ruluko', 'Rum Raisin', 'Ruslan Display', 'Russo One', 'Ruthie', 'Rye', 'Sacramento', 'Sahitya', 'Sail', 'Saira', 'Saira Condensed', 'Saira Extra Condensed', 'Saira Semi Condensed', 'Salsa', 'Sanchez', 'Sancreek', 'Sansita', 'Sarala', 'Sarina', 'Sarpanch', 'Satisfy', 'Scada', 'Scheherazade', 'Schoolbell', 'Scope One', 'Seaweed Script', 'Secular One', 'Sedgwick Ave', 'Sedgwick Ave Display', 'Sevillana', 'Seymour One', 'Shadows Into Light', 'Shadows Into Light Two', 'Shanti', 'Share', 'Share Tech', 'Share Tech Mono', 'Shojumaru', 'Short Stack', 'Shrikhand', 'Siemreap', 'Sigmar One', 'Signika', 'Signika Negative', 'Simonetta', 'Sintony', 'Sirin Stencil', 'Six Caps', 'Skranji', 'Slabo 13px', 'Slabo 27px', 'Slackey', 'Smokum', 'Smythe', 'Sniglet', 'Snippet', 'Snowburst One', 'Sofadi One', 'Sofia', 'Sonsie One', 'Sorts Mill Goudy', 'Source Code Pro', 'Source Sans Pro', 'Source Serif Pro', 'Space Mono', 'Special Elite', 'Spectral', 'Spectral SC', 'Spicy Rice', 'Spinnaker', 'Spirax', 'Squada One', 'Sree Krushnadevaraya', 'Sriracha', 'Stalemate', 'Stalinist One', 'Stardos Stencil', 'Stint Ultra Condensed', 'Stint Ultra Expanded', 'Stoke', 'Strait', 'Sue Ellen Francisco', 'Suez One', 'Sumana', 'Sunshiney', 'Supermercado One', 'Sura', 'Suranna', 'Suravaram', 'Suwannaphum', 'Swanky and Moo Moo', 'Syncopate', 'Tangerine', 'Taprom', 'Tauri', 'Taviraj', 'Teko', 'Telex', 'Tenali Ramakrishna', 'Tenor Sans', 'Text Me One', 'The Girl Next Door', 'Tienne', 'Tillana', 'Timmana', 'Tinos', 'Titan One', 'Titillium Web', 'Trade Winds', 'Trirong', 'Trocchi', 'Trochut', 'Trykker', 'Tulpen One', 'Ubuntu', 'Ubuntu Condensed', 'Ubuntu Mono', 'Ultra', 'Uncial Antiqua', 'Underdog', 'Unica One', 'UnifrakturCook', 'UnifrakturMaguntia', 'Unkempt', 'Unlock', 'Unna', 'VT323', 'Vampiro One', 'Varela', 'Varela Round', 'Vast Shadow', 'Vesper Libre', 'Vibur', 'Vidaloka', 'Viga', 'Voces', 'Volkhov', 'Vollkorn', 'Voltaire', 'Waiting for the Sunrise', 'Wallpoet', 'Walter Turncoat', 'Warnes', 'Wellfleet', 'Wendy One', 'Wire One', 'Work Sans', 'Yanone Kaffeesatz', 'Yantramanav', 'Yatra One', 'Yellowtail', 'Yeseva One', 'Yesteryear', 'Yrsa', 'Zeyada', 'Zilla Slab', 'Zilla Slab Highlight'
    ],

    Init: function () {
        this.getElements();
        this.createBufferElement();
        this.setupMarkdownRenderers();
        this.InitializeMermaid();
        this.debouncedUpdate = debounce(this.UpdatePreview.bind(this), this.config.debounceDelay);
        this.setupEventListeners();
        this.initializeResponsiveUI();
        this.setupResizeHandle();
        this.populateGoogleFonts();
        this.setupFontSearch();
        this.setupAutosave();
        this.LoadFromLocalStorage();
        this.state.lastText = this.elements.textarea.value;

        // Immediate initial rendering (don't wait for library check)
        if (this.elements.textarea.value) {
            this.UpdatePreview(true); // Force update regardless of lastText comparison
        }

        this.CheckLibraries();
    },

    getElements: function () {
        this.elements.textarea = document.getElementById("markdown-input");
        this.elements.previewContent = document.getElementById("preview-content");
        this.elements.previewPane = document.getElementById("preview-pane");
        this.elements.toolbar = document.querySelector(".toolbar");
        this.elements.markdownItBtn = document.getElementById("btn-markdown-it");
        this.elements.markedBtn = document.getElementById("btn-marked");
        this.elements.mathJaxBtn = document.getElementById("btn-mathjax");
        this.elements.kaTeXBtn = document.getElementById("btn-katex");
        this.elements.downloadBtn = document.getElementById("btn-download");
        this.elements.downloadPdfBtn = document.getElementById("btn-download-pdf");
        this.elements.downloadMdBtn = document.getElementById("btn-download-md");
        this.elements.downloadTxtBtn = document.getElementById("btn-download-txt");
        this.elements.toggleCssBtn = document.getElementById("btn-toggle-css");
        this.elements.customCssContainer = document.getElementById("custom-css-container");
        this.elements.applyCssBtn = document.getElementById("btn-apply-css");
        this.elements.closeCssBtn = document.getElementById("btn-close-css");
        this.elements.resetCssBtn = document.getElementById("btn-reset-css");
        this.elements.customStyleTag = document.getElementById("custom-styles-output");
        this.elements.showEditorBtn = document.getElementById("btn-show-editor");
        this.elements.showPreviewBtn = document.getElementById("btn-show-preview");
        this.elements.autosaveIndicator = document.getElementById("autosave-indicator");
        
        // Style editor elements
        this.elements.fontFamilySelect = document.getElementById("font-family-select");
        this.elements.fontSearchInput = document.getElementById("font-search");
        this.elements.fontSizeInput = document.getElementById("font-size-input");
        this.elements.textColorInput = document.getElementById("text-color");
        this.elements.boldColorInput = document.getElementById("bold-color");
        this.elements.italicColorInput = document.getElementById("italic-color");
        this.elements.headingColorInput = document.getElementById("heading-color");
        this.elements.showHeadingBorderCheckbox = document.getElementById("show-heading-border");
        this.elements.headingBorderColorInput = document.getElementById("heading-border-color");
        this.elements.headingBorderColorGroup = document.getElementById("heading-border-color-group");
        this.elements.linkColorInput = document.getElementById("link-color");
        this.elements.bgColorInput = document.getElementById("bg-color");
        this.elements.codeTextColorInput = document.getElementById("code-text-color");
        this.elements.codeBgColorInput = document.getElementById("code-bg-color");
        this.elements.lineHeightInput = document.getElementById("line-height-input");

        if (!this.elements.textarea || !this.elements.previewContent || !this.elements.previewPane) {
            console.error("Critical elements not found. Aborting initialization.");
            alert("Error initializing editor: Required elements missing.");
            return false;
        }
        return true;
    },

    createBufferElement: function () {
        this.elements.buffer = document.createElement('div');
        this.elements.buffer.id = "mathjax-buffer";
        this.elements.buffer.style.display = 'none';
        document.body.appendChild(this.elements.buffer);
    },

    setupMarkdownRenderers: function () {
        if (typeof markdownit !== 'function') {
            console.error("markdown-it library not loaded.");
            alert("Error initializing editor: markdown-it library failed to load.");
            return false;
        } else {
            this.state.libsReady.markdownIt = true;
        }

        this.markdownItInstance = window.markdownit({
            html: true,
            linkify: true,
            typographer: true,
            highlight: (str, lang) => this.handleCodeHighlighting(str, lang)
        });

        if (typeof markdownitFootnote === 'function') {
            this.markdownItInstance = this.markdownItInstance.use(markdownitFootnote);
        }

        if (typeof marked !== 'undefined') {
            this.state.libsReady.marked = true;
            marked.setOptions({
                renderer: new marked.Renderer(),
                highlight: (code, lang) => this.handleCodeHighlighting(code, lang),
                pedantic: false,
                gfm: true,
                breaks: false,
                sanitize: false,
                smartLists: true,
                smartypants: false,
                xhtml: false
            });
            this.markedInstance = marked;
        }
        return true;
    },

    handleCodeHighlighting: function (code, lang) {
        if (lang && lang === 'mermaid') {
            return `<pre class="mermaid">${this.EscapeHtml(code)}</pre>`;
        }
        if (lang && typeof hljs !== 'undefined' && hljs.getLanguage(lang)) {
            try {
                const highlightedCode = hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
                return `<pre class="hljs language-${lang}"><code>${highlightedCode}</code></pre>`;
            } catch (e) {
                console.warn("Highlight.js error:", e);
            }
        }
        return `<pre class="hljs"><code>${this.markdownItInstance?.utils.escapeHtml(code) || code}</code></pre>`;
    },
 // Detect lines with LaTeX even without brackets nd wrap them in $$...$$ 🤔
    processLatexPaste: function(text) {
        const lines = text.split('\n');
        return lines.map(line => {
            const trimmed = line.trim();
            if (trimmed && 
                !trimmed.startsWith('$$') && 
                !trimmed.startsWith('\\[') && 
                !trimmed.endsWith('$$') && 
                !trimmed.endsWith('\\]') && 
                !/\$.*\$/.test(trimmed) && // Check if line already has $ delimiters
                !/\\[()\[\]]/.test(trimmed) && // Check if line already has \( \) or \[ \] delimiters
                /\\[a-zA-Z]+\b/.test(trimmed)) { // Has LaTeX commands
                return `$$${trimmed}$$`;
            }
            return line;
        }).join('\n');
    },

    setupEventListeners: function () {
        this.elements.textarea.addEventListener('input', () => {
            this.SaveToLocalStorage();
            this.debouncedUpdate();
        });

        // Replace the existing paste listener with this
        this.elements.textarea.addEventListener('paste', (e) => {
            const clipboardData = e.clipboardData || window.clipboardData;
            const pastedText = clipboardData.getData('text/plain');
            const processedText = this.processLatexPaste(pastedText);
            
            // Prevent default paste and insert modified text
            e.preventDefault();
            document.execCommand('insertText', false, processedText);
            
            // Trigger update
            setTimeout(() => this.UpdatePreview(true), 0);
        });

        this.elements.markdownItBtn.addEventListener('click', () => this.SetMarkdownEngine('markdown-it'));
        this.elements.markedBtn.addEventListener('click', () => this.SetMarkdownEngine('marked'));
        this.elements.mathJaxBtn.addEventListener('click', () => this.SetMathEngine('mathjax'));
        this.elements.kaTeXBtn.addEventListener('click', () => this.SetMathEngine('katex'));
        this.elements.downloadPdfBtn.addEventListener('click', () => this.DownloadAs('pdf'));
        this.elements.downloadMdBtn.addEventListener('click', () => this.DownloadAs('md'));
        this.elements.downloadTxtBtn.addEventListener('click', () => this.DownloadAs('txt'));
        this.elements.toggleCssBtn.addEventListener('click', this.ToggleCustomCSS.bind(this));
        this.elements.applyCssBtn.addEventListener('click', this.ApplyCustomCSS.bind(this));
        this.elements.resetCssBtn.addEventListener('click', this.ResetStyles.bind(this));
        this.elements.closeCssBtn.addEventListener('click', this.ToggleCustomCSS.bind(this));
        
        // Toggle heading border color visibility
        if (this.elements.showHeadingBorderCheckbox) {
            this.elements.showHeadingBorderCheckbox.addEventListener('change', this.toggleHeadingBorderColorVisibility.bind(this));
        }
    },

    initializeResponsiveUI: function () {
        this.CheckMobileView();
        window.addEventListener('resize', this.CheckMobileView.bind(this));

        if (this.elements.showEditorBtn && this.elements.showPreviewBtn) {
            this.elements.showEditorBtn.addEventListener('click', () => this.SetMobilePane('editor'));
            this.elements.showPreviewBtn.addEventListener('click', () => this.SetMobilePane('preview'));
        }

        this.ConnectMobileMenuButtons();
    },

    setupAutosave: function () {
        this.autosaveTimer = setInterval(() => {
            if (this.elements.textarea.value !== this.state.lastText) {
                this.SaveToLocalStorage();
                this.state.lastText = this.elements.textarea.value;
            }
        }, this.config.autosaveInterval);

        if (this.elements.autosaveIndicator) {
            this.updateAutosaveIndicator();
        }
    },

    setupResizeHandle: function () {
        const resizeHandle = document.getElementById('resize-handle');
        const editorPane = document.getElementById('editor-pane');
        const previewPane = document.getElementById('preview-pane');
        const container = document.querySelector('.container');

        if (!resizeHandle || !editorPane || !previewPane || !container) return;

        let isResizing = false;

        const startResize = (e) => {
            isResizing = true;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        };

        const stopResize = () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        };

        const resize = (e) => {
            if (!isResizing) return;

            const containerRect = container.getBoundingClientRect();
            const offsetX = e.clientX - containerRect.left;
            const containerWidth = containerRect.width;

            // Calculate percentage (between 20% and 80% to prevent too small panes)
            let percentage = (offsetX / containerWidth) * 100;
            percentage = Math.max(20, Math.min(80, percentage));

            editorPane.style.flex = `0 0 ${percentage}%`;
            previewPane.style.flex = `1`;
        };

        resizeHandle.addEventListener('mousedown', startResize);
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    },

    populateGoogleFonts: function () {
        const select = this.elements.fontFamilySelect;
        if (!select) return;

        // Clear existing options except system default and standard fonts
        const standardFonts = `
            <option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">System Default</option>
            <option value="Arial, sans-serif">Arial</option>
            <option value="'Times New Roman', Times, serif">Times New Roman</option>
            <option value="'Courier New', Courier, monospace">Courier New</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="Verdana, sans-serif">Verdana</option>
            <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
            <option value="Impact, Charcoal, sans-serif">Impact</option>
            <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
            <option value="'Arial Black', Gadget, sans-serif">Arial Black</option>
            <option value="Tahoma, Geneva, sans-serif">Tahoma</option>
            <option value="'Palatino Linotype', 'Book Antiqua', Palatino, serif">Palatino</option>
            <option value="'Lucida Console', Monaco, monospace">Lucida Console</option>
            <option value="'Lucida Sans Unicode', 'Lucida Grande', sans-serif">Lucida Sans</option>
        `;
        
        select.innerHTML = standardFonts;

        // Add separator
        const separator = document.createElement('option');
        separator.disabled = true;
        separator.textContent = '─────── Google Fonts ───────';
        select.appendChild(separator);

        // Add all Google Fonts
        this.googleFonts.forEach(font => {
            const option = document.createElement('option');
            option.value = `'${font}', sans-serif`;
            option.textContent = font;
            option.style.fontFamily = `'${font}', sans-serif`;
            select.appendChild(option);
        });
    },

    setupFontSearch: function () {
        const searchInput = this.elements.fontSearchInput;
        const select = this.elements.fontFamilySelect;
        if (!searchInput || !select) return;

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const options = select.querySelectorAll('option');

            options.forEach(option => {
                const fontName = option.textContent.toLowerCase();
                if (fontName.includes(searchTerm)) {
                    option.style.display = '';
                } else {
                    option.style.display = 'none';
                }
            });

            // Auto-select first visible option if searching
            if (searchTerm) {
                const firstVisible = Array.from(options).find(opt => opt.style.display !== 'none');
                if (firstVisible) {
                    firstVisible.selected = true;
                }
            }
        });

        // Load font when selected
        select.addEventListener('change', () => {
            this.loadSelectedFont();
        });
    },

    loadSelectedFont: function () {
        const selectedValue = this.elements.fontFamilySelect.value;
        if (!selectedValue || selectedValue.includes('apple-system')) return;

        // Extract font name from the CSS value
        const fontMatch = selectedValue.match(/'([^']+)'/);
        if (!fontMatch) return;
        
        const fontName = fontMatch[1];
        
        // Check if font is already loaded
        const existingLink = document.querySelector(`link[href*="${fontName.replace(/\s+/g, '+')}"]`);
        if (existingLink) return;

        // Load the font dynamically
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
        document.head.appendChild(link);
    },

    updateAutosaveIndicator: function () {
        if (!this.elements.autosaveIndicator) return;

        const now = new Date();
        if (this.state.lastSavedTime) {
            const secondsAgo = Math.floor((now - this.state.lastSavedTime) / 1000);
            if (secondsAgo < 60) {
                this.elements.autosaveIndicator.textContent = `Saved ${secondsAgo}s ago`;
            } else {
                const minutesAgo = Math.floor(secondsAgo / 60);
                this.elements.autosaveIndicator.textContent = `Saved ${minutesAgo}m ago`;
            }
        } else {
            this.elements.autosaveIndicator.textContent = "Auto-saved";
        }
    },

    CheckLibraries: function () {
        if (typeof MathJax !== 'undefined' && MathJax.Hub) {
            this.state.libsReady.mathJax = true;
        }

        if (typeof katex !== 'undefined' && typeof renderMathInElement === 'function') {
            this.state.libsReady.katex = true;
        }

        if (typeof mermaid !== 'undefined' && typeof mermaid.mermaidAPI !== 'undefined') {
            this.state.libsReady.mermaid = true;
        }

        if (typeof hljs !== 'undefined') {
            this.state.libsReady.hljs = true;
        }

        if (this.AllLibrariesReady() && !this.state.isInitialized) {
            this.state.isInitialized = true;
            this.UpdatePreview(true); // Force update to ensure preview reflects current content
        } else if (!this.state.isInitialized) {
            setTimeout(() => this.CheckLibraries(), 300);
        }
    },

    AllLibrariesReady: function () {
        return (this.state.libsReady.markdownIt || this.state.libsReady.marked) &&
            (this.state.libsReady.mathJax || this.state.libsReady.katex);
    },

    InitializeMermaid: function () {
        if (typeof mermaid !== 'undefined') {
            try {
                mermaid.initialize({
                    startOnLoad: false,
                    theme: 'default',
                    securityLevel: 'loose',
                    fontFamily: 'sans-serif',
                    logLevel: 'fatal',
                });
                this.state.libsReady.mermaid = true;
            } catch (e) {
                console.error("Failed to initialize Mermaid:", e);
            }
        }
    },

    UpdatePreview: function (force = false) {
        const text = this.elements.textarea.value;
        if (!force && text === this.state.lastText && this.state.lastText !== '') return;

        try {
            const scrollPercent = this.elements.previewPane.scrollTop /
                (this.elements.previewPane.scrollHeight - this.elements.previewPane.clientHeight);

            if (this.state.currentMarkdownEngine === 'markdown-it' && this.state.libsReady.markdownIt) {
                this.state.lastRenderedHTML = this.markdownItInstance.render(text);
                this.elements.previewContent.innerHTML = this.state.lastRenderedHTML;
                this.ProcessMath();
                this.ProcessMermaid();
            }
            else if (this.state.currentMarkdownEngine === 'marked' && this.state.libsReady.marked) {
                this.RenderWithMarked(text, scrollPercent);
                return;
            }
            else {
                // Try to use any available engine rather than showing error
                if (this.state.libsReady.markdownIt) {
                    this.state.lastRenderedHTML = this.markdownItInstance.render(text);
                    this.elements.previewContent.innerHTML = this.state.lastRenderedHTML;
                    this.ProcessMath();
                    this.ProcessMermaid();
                } else if (this.state.libsReady.marked) {
                    this.RenderWithMarked(text, scrollPercent);
                    return;
                } else {
                    console.error("No valid markdown engine available");
                    this.elements.previewContent.innerHTML = '<p>Error: No valid markdown renderer available</p>';
                    return;
                }
            }

            this._restoreScrollPosition(scrollPercent);
            this.state.lastText = text;

        } catch (err) {
            console.error("Error during rendering:", err);
            this.elements.previewContent.innerHTML = `<p style='color: red; font-weight: bold;'>Error rendering preview. Check console for details.</p><pre>${this.EscapeHtml(err.stack || err.message)}</pre>`;
        }
    },

    RenderWithMarked: function (text, scrollPercent) {
        if (!this.elements.buffer) {
            this.createBufferElement();
        }

        if (this.state.currentMathEngine === 'mathjax') {
            try {
                if (!this.state.mathJaxRunning) {
                    this.state.mathJaxRunning = true;
                    const escapedText = this.EscapeHtml(text);
                    this.elements.buffer.innerHTML = escapedText;

                    MathJax.Hub.Queue(
                        ["resetEquationNumbers", MathJax.InputJax.TeX],
                        ["Typeset", MathJax.Hub, this.elements.buffer],
                        () => {
                            try {
                                const mathJaxProcessedHtml = this.elements.buffer.innerHTML;
                                const finalHtml = marked.parse(mathJaxProcessedHtml);
                                this.elements.previewContent.innerHTML = finalHtml;
                                this.ProcessMermaid();
                                this._restoreScrollPosition(scrollPercent);
                                this.state.lastText = text;
                            } catch (err) {
                                console.error("Error updating preview after MathJax:", err);
                                this.elements.previewContent.innerHTML = `<p style='color: red;'>Error updating preview with MathJax.</p>`;
                            } finally {
                                this.state.mathJaxRunning = false;
                            }
                        }
                    );
                }
            } catch (err) {
                console.error("Error during MathJax+marked rendering:", err);
                this.elements.previewContent.innerHTML = `<p style='color: red;'>Error rendering preview with MathJax.</p>`;
                this.state.mathJaxRunning = false;
            }
        } else {
            try {
                const html = marked.parse(text);
                this.elements.previewContent.innerHTML = html;

                if (this.state.currentMathEngine === 'katex') {
                    this.ProcessMath();
                }

                this.ProcessMermaid();
                this._restoreScrollPosition(scrollPercent);
                this.state.lastText = text;
            } catch (err) {
                console.error("Error during standard marked rendering:", err);
                this.elements.previewContent.innerHTML = `<p style='color: red;'>Error rendering preview with marked.</p>`;
            }
        }
    },

    _restoreScrollPosition: function (scrollPercent) {
        requestAnimationFrame(() => {
            const newScrollHeight = this.elements.previewPane.scrollHeight;
            const newScrollTop = scrollPercent * (newScrollHeight - this.elements.previewPane.clientHeight);
            if (isFinite(scrollPercent) && newScrollHeight > this.elements.previewPane.clientHeight) {
                this.elements.previewPane.scrollTop = newScrollTop;
            } else {
                this.elements.previewPane.scrollTop = 0;
            }
        });
    },

    ProcessMath: function () {
        if (!this.elements.previewContent) return;

        try {
            if (this.state.currentMathEngine === 'katex' && this.state.libsReady.katex) {
                if (typeof renderMathInElement === 'function') {
                    renderMathInElement(this.elements.previewContent, {
                        delimiters: [
                            { left: "$$", right: "$$", display: true },
                            { left: "\\[", right: "\\]", display: true },
                            { left: "$", right: "$", display: false },
                            { left: "\\(", right: "\\)", display: false }
                        ],
                        throwOnError: false
                    });
                }
            } else if (this.state.currentMathEngine === 'mathjax' && this.state.libsReady.mathJax) {
                if (typeof MathJax !== 'undefined' && MathJax.Hub) {
                    if (this.config.mathJaxProcessing) return;
                    this.config.mathJaxProcessing = true;
                    MathJax.Hub.Queue(
                        ["Typeset", MathJax.Hub, this.elements.previewContent],
                        () => { this.config.mathJaxProcessing = false; }
                    );
                }
            }
        } catch (err) {
            console.error(`Error processing math:`, err);
            const errorDiv = document.createElement('div');
            errorDiv.style.color = 'orange';
            errorDiv.textContent = `Math processing error. Check console.`;
            this.elements.previewContent.prepend(errorDiv);
        }
    },

    ProcessMermaid: function () {
        if (typeof mermaid === 'undefined' || !this.elements.previewContent) return;

        const mermaidBlocks = this.elements.previewContent.querySelectorAll('pre.mermaid');
        if (mermaidBlocks.length === 0) return;

        try {
            mermaid.init(undefined, mermaidBlocks);
        } catch (err) {
            console.error("Error initializing mermaid diagrams:", err);
            mermaidBlocks.forEach((block, index) => {
                try {
                    const container = document.createElement('div');
                    container.className = 'mermaid-diagram';
                    const code = this.UnescapeHtml(block.textContent || "").trim();
                    container.textContent = code;

                    if (block.parentNode) {
                        block.parentNode.replaceChild(container, block);
                        mermaid.init(undefined, container);
                    }
                } catch (blockErr) {
                    console.error(`Error rendering mermaid block ${index}:`, blockErr);
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'mermaid-error';
                    errorDiv.innerHTML = `
                        <strong>Mermaid Diagram Error</strong><br>
                        <p>There was a problem rendering this diagram. Check your syntax.</p>
                        <details>
                            <summary>View Error Details</summary>
                            <pre>${this.EscapeHtml(blockErr.message || String(blockErr))}</pre>
                        </details>
                        <details>
                            <summary>View Diagram Source</summary>
                            <pre>${this.EscapeHtml(block.textContent || "")}</pre>
                        </details>
                    `;
                    if (block.parentNode) {
                        block.parentNode.replaceChild(errorDiv, block);
                    }
                }
            });
        }
    },

    CheckMobileView: function () {
        const wasMobile = this.state.isMobileView;
        this.state.isMobileView = window.innerWidth <= 768;

        if (wasMobile !== this.state.isMobileView) {
            if (this.state.isMobileView) {
                this.SetMobilePane(this.state.currentMobilePane);
            } else {
                if (this.elements.textarea && this.elements.textarea.parentElement) {
                    this.elements.textarea.parentElement.style.display = 'flex';
                }
                if (this.elements.previewPane) {
                    this.elements.previewPane.style.display = 'flex';
                }
            }
        }
    },

    SetMobilePane: function (pane) {
        if (!this.state.isMobileView) return;

        this.state.currentMobilePane = pane;

        if (this.elements.showEditorBtn && this.elements.showPreviewBtn) {
            this.elements.showEditorBtn.classList.toggle('active', pane === 'editor');
            this.elements.showPreviewBtn.classList.toggle('active', pane === 'preview');
        }

        if (this.elements.textarea && this.elements.textarea.parentElement) {
            this.elements.textarea.parentElement.style.display = pane === 'editor' ? 'flex' : 'none';
        }

        if (this.elements.previewPane) {
            this.elements.previewPane.style.display = pane === 'preview' ? 'flex' : 'none';
        }

        if (pane === 'preview') {
            this.UpdatePreview();
        }
    },

    SetMarkdownEngine: function (engine) {
        if (engine !== this.state.currentMarkdownEngine) {
            this.state.currentMarkdownEngine = engine;
            this.elements.markdownItBtn.classList.toggle('active', engine === 'markdown-it');
            this.elements.markedBtn.classList.toggle('active', engine === 'marked');
            
            // Update mobile buttons
            const mobileMarkdownItBtn = document.getElementById('btn-markdown-it-mobile');
            const mobileMarkedBtn = document.getElementById('btn-marked-mobile');
            if (mobileMarkdownItBtn && mobileMarkedBtn) {
                mobileMarkdownItBtn.classList.toggle('active', engine === 'markdown-it');
                mobileMarkedBtn.classList.toggle('active', engine === 'marked');
            }
            
            this.state.lastText = '';
            this.UpdatePreview();
        }
    },

    SetMathEngine: function (engine) {
        if (engine !== this.state.currentMathEngine) {
            this.state.currentMathEngine = engine;
            this.elements.mathJaxBtn.classList.toggle('active', engine === 'mathjax');
            this.elements.kaTeXBtn.classList.toggle('active', engine === 'katex');
            
            // Update mobile buttons
            const mobileMathJaxBtn = document.getElementById('btn-mathjax-mobile');
            const mobileKaTeXBtn = document.getElementById('btn-katex-mobile');
            if (mobileMathJaxBtn && mobileKaTeXBtn) {
                mobileMathJaxBtn.classList.toggle('active', engine === 'mathjax');
                mobileKaTeXBtn.classList.toggle('active', engine === 'katex');
            }
            
            this.state.lastText = '';
            this.UpdatePreview();
        }
    },

    ToggleCustomCSS: function () {
        this.state.customCssVisible = !this.state.customCssVisible;
        this.elements.customCssContainer.style.display = this.state.customCssVisible ? 'flex' : 'none';
        this.elements.toggleCssBtn.textContent = this.state.customCssVisible ? 'Hide Editor' : 'Style Editor';

        if (this.state.customCssVisible) {
            this.LoadStyleSettings();
            this.toggleHeadingBorderColorVisibility();
        }
    },

    toggleHeadingBorderColorVisibility: function () {
        if (this.elements.showHeadingBorderCheckbox && this.elements.headingBorderColorGroup) {
            const isChecked = this.elements.showHeadingBorderCheckbox.checked;
            this.elements.headingBorderColorGroup.style.display = isChecked ? 'flex' : 'none';
        }
    },

    ApplyCustomCSS: function () {
        const styles = {
            fontFamily: this.elements.fontFamilySelect.value,
            fontSize: this.elements.fontSizeInput.value + 'px',
            textColor: this.elements.textColorInput.value,
            boldColor: this.elements.boldColorInput.value,
            italicColor: this.elements.italicColorInput.value,
            headingColor: this.elements.headingColorInput.value,
            showHeadingBorder: this.elements.showHeadingBorderCheckbox.checked,
            headingBorderColor: this.elements.headingBorderColorInput.value,
            linkColor: this.elements.linkColorInput.value,
            bgColor: this.elements.bgColorInput.value,
            codeTextColor: this.elements.codeTextColorInput.value,
            codeBgColor: this.elements.codeBgColorInput.value,
            lineHeight: this.elements.lineHeightInput.value,
        };

        const headingBorderStyle = styles.showHeadingBorder 
            ? `border-bottom: 1px solid ${styles.headingBorderColor} !important;`
            : 'border-bottom: none !important;';

        const css = `
            #preview-content {
                font-family: ${styles.fontFamily} !important;
                font-size: ${styles.fontSize} !important;
                color: ${styles.textColor} !important;
                background-color: ${styles.bgColor} !important;
                line-height: ${styles.lineHeight} !important;
            }
            #preview-pane {
                background-color: ${styles.bgColor} !important;
            }
            #preview-content strong,
            #preview-content b {
                color: ${styles.boldColor} !important;
            }
            #preview-content em,
            #preview-content i {
                color: ${styles.italicColor} !important;
            }
            #preview-content h1,
            #preview-content h2,
            #preview-content h3,
            #preview-content h4,
            #preview-content h5,
            #preview-content h6 {
                color: ${styles.headingColor} !important;
                ${headingBorderStyle}
            }
            #preview-content a {
                color: ${styles.linkColor} !important;
            }
            #preview-content :not(pre) > code,
            #preview-content p code,
            #preview-content li code,
            #preview-content td code,
            #preview-content h1 code,
            #preview-content h2 code,
            #preview-content h3 code,
            #preview-content h4 code,
            #preview-content h5 code,
            #preview-content h6 code {
                color: ${styles.codeTextColor} !important;
                background-color: ${styles.codeBgColor} !important;
            }
            #preview-content pre {
                background-color: ${styles.codeBgColor} !important;
            }
        `;

        this.elements.customStyleTag.innerHTML = css;
        
        try {
            localStorage.setItem('markdownEditorStyles', JSON.stringify(styles));
        } catch (err) {
            console.error("Error saving styles:", err);
        }
    },

    ResetStyles: function () {
        // Reset to default values
        this.elements.fontFamilySelect.value = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
        this.elements.fontSizeInput.value = "16";
        this.elements.textColorInput.value = "#000000";
        this.elements.boldColorInput.value = "#000000";
        this.elements.italicColorInput.value = "#000000";
        this.elements.headingColorInput.value = "#000000";
        this.elements.showHeadingBorderCheckbox.checked = true;
        this.elements.headingBorderColorInput.value = "#E5D0AC";
        this.elements.linkColorInput.value = "#0366d6";
        this.elements.bgColorInput.value = "#FEF9E1";
        this.elements.codeTextColorInput.value = "#A31D1D";
        this.elements.codeBgColorInput.value = "#F0EADC";
        this.elements.lineHeightInput.value = "1.6";

        // Clear search input
        if (this.elements.fontSearchInput) {
            this.elements.fontSearchInput.value = '';
            // Show all fonts
            const options = this.elements.fontFamilySelect.querySelectorAll('option');
            options.forEach(opt => opt.style.display = '');
        }

        // Update visibility
        this.toggleHeadingBorderColorVisibility();

        // Clear custom styles
        this.elements.customStyleTag.innerHTML = '';
        
        try {
            localStorage.removeItem('markdownEditorStyles');
        } catch (err) {
            console.error("Error clearing styles:", err);
        }
    },

    LoadStyleSettings: function () {
        try {
            const savedStyles = localStorage.getItem('markdownEditorStyles');
            if (savedStyles) {
                const styles = JSON.parse(savedStyles);
                this.elements.fontFamilySelect.value = styles.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
                this.elements.fontSizeInput.value = parseInt(styles.fontSize) || 16;
                this.elements.textColorInput.value = styles.textColor || "#000000";
                this.elements.boldColorInput.value = styles.boldColor || "#000000";
                this.elements.italicColorInput.value = styles.italicColor || "#000000";
                this.elements.headingColorInput.value = styles.headingColor || "#000000";
                this.elements.showHeadingBorderCheckbox.checked = styles.showHeadingBorder !== undefined ? styles.showHeadingBorder : true;
                this.elements.headingBorderColorInput.value = styles.headingBorderColor || "#E5D0AC";
                this.elements.linkColorInput.value = styles.linkColor || "#0366d6";
                // Use bgColor if available, otherwise fall back to contentBgColor or paneBgColor from old versions
                this.elements.bgColorInput.value = styles.bgColor || styles.contentBgColor || styles.paneBgColor || "#FEF9E1";
                this.elements.codeTextColorInput.value = styles.codeTextColor || "#A31D1D";
                this.elements.codeBgColorInput.value = styles.codeBgColor || "#F0EADC";
                this.elements.lineHeightInput.value = styles.lineHeight || "1.6";

                // Update visibility of heading border color
                this.toggleHeadingBorderColorVisibility();

                // Apply the saved styles
                this.ApplyCustomCSS();
            }
        } catch (err) {
            console.error("Error loading styles:", err);
        }
    },

    DownloadAs: function (format) {
        const text = this.state.lastText;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `markdown_export_${timestamp}.${format}`;

        if (format === 'txt' || format === 'md') {
            const blob = new Blob([text], { type: format === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8' });
            this._triggerDownload(blob, filename);
        } else if (format === 'pdf') {
            this._generatePdf(filename);
        }
    },

    _triggerDownload: function (blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    },

    _generatePdf: async function (filename) {
        if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
            alert('PDF generation libraries not loaded yet. Please try again in a moment.');
            return;
        }

        const previewContent = this.elements.previewContent;
        if (!previewContent) return;

        const downloadBtn = this.elements.downloadPdfBtn || document.getElementById('btn-download-pdf-mobile');
        if (downloadBtn) {
            downloadBtn.textContent = 'Generating...';
            downloadBtn.disabled = true;
        }

        try {
            const printContainer = document.createElement('div');
printContainer.className = 'pdf-container';
printContainer.innerHTML = previewContent.innerHTML;

// 💥 Force inline span layout for all h1s (PDF workaround)
printContainer.querySelectorAll("h1").forEach(h => {
    const text = h.textContent;
    h.innerHTML = ''; // clear
    text.split(' ').forEach(word => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        span.style.display = 'inline-block';
        span.style.marginRight = '0.25em';
        h.appendChild(span);
    });
    h.style.fontFamily = "Arial, sans-serif";
    h.style.fontSize = "24pt";
    h.style.fontWeight = "bold";
});
            printContainer.style.width = '650px';
            printContainer.style.backgroundColor = 'white';
            printContainer.style.color = 'black';
            printContainer.style.padding = '40px';
            printContainer.style.fontSize = '12pt';
            printContainer.style.lineHeight = '1.4';
            printContainer.style.position = 'absolute';
            printContainer.style.top = '0';
            printContainer.style.left = '-9999px';
            document.body.appendChild(printContainer);

            if (this.state.currentMathEngine === 'mathjax' && typeof MathJax !== 'undefined') {
                await new Promise((resolve) => {
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub, printContainer], resolve);
                });
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            const codeBlocks = printContainer.querySelectorAll('pre, code');
            codeBlocks.forEach(block => {
                block.style.fontSize = '10pt';
                block.style.overflow = 'hidden';
                block.style.whiteSpace = 'pre-wrap';
                block.style.wordWrap = 'break-word';
                block.style.border = '1px solid #ccc';
                block.style.padding = '8px';
                block.style.borderRadius = '3px';
                block.style.backgroundColor = '#f8f8f8';
            });

            const { jsPDF } = jspdf;
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 40;
            const contentWidth = pageWidth - (margin * 2);
            const pdfOptions = {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
            };

            const canvas = await html2canvas(printContainer, pdfOptions);
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const imgWidth = contentWidth;
            const ratio = canvas.height / canvas.width;
            const imgHeight = contentWidth * ratio;

            const pageInnerHeight = pageHeight - (margin * 2);
            let heightLeft = imgHeight;
            let position = margin;
            let pageCount = 1;

            pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
            heightLeft -= pageInnerHeight;

            while (heightLeft > 0) {
                pageCount++;
                position = heightLeft - imgHeight + margin;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
                heightLeft -= pageInnerHeight;
            }

            pdf.save(filename);
            document.body.removeChild(printContainer);

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert(`Error generating PDF: ${error.message || 'Unknown error'}`);
        } finally {
            if (downloadBtn) {
                downloadBtn.textContent = 'Save as PDF';
                downloadBtn.disabled = false;
            }
        }
    },

    EscapeHtml: function (str) {
        if (!str) return "";
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    UnescapeHtml: function (str) {
        if (!str) return "";
        try {
            const doc = new DOMParser().parseFromString(str, 'text/html');
            return doc.documentElement.textContent || "";
        } catch (e) {
            console.error("Error unescaping HTML:", e);
            return str;
        }
    },

    ConnectMobileMenuButtons: function () {
        const mobileButtons = {
            markdownIt: document.getElementById('btn-markdown-it-mobile'),
            marked: document.getElementById('btn-marked-mobile'),
            mathjax: document.getElementById('btn-mathjax-mobile'),
            katex: document.getElementById('btn-katex-mobile'),
            downloadPdf: document.getElementById('btn-download-pdf-mobile'),
            downloadMd: document.getElementById('btn-download-md-mobile'),
            downloadTxt: document.getElementById('btn-download-txt-mobile'),
            toggleCss: document.getElementById('btn-toggle-css-mobile'),
        };

        const mobileMenu = document.getElementById('mobile-menu');
        const hamburgerBtn = document.getElementById('mobile-hamburger');

        const closeMenu = () => {
            if (mobileMenu && hamburgerBtn) {
                mobileMenu.classList.remove('open');
                hamburgerBtn.classList.remove('active');
            }
        };

        if (mobileButtons.markdownIt && mobileButtons.marked) {
            mobileButtons.markdownIt.addEventListener('click', () => {
                this.SetMarkdownEngine('markdown-it');
                closeMenu();
            });

            mobileButtons.marked.addEventListener('click', () => {
                this.SetMarkdownEngine('marked');
                closeMenu();
            });
        }

        if (mobileButtons.mathjax && mobileButtons.katex) {
            mobileButtons.mathjax.addEventListener('click', () => {
                this.SetMathEngine('mathjax');
                closeMenu();
            });

            mobileButtons.katex.addEventListener('click', () => {
                this.SetMathEngine('katex');
                closeMenu();
            });
        }

        if (mobileButtons.downloadPdf) {
            mobileButtons.downloadPdf.addEventListener('click', () => {
                this.DownloadAs('pdf');
                closeMenu();
            });
        }

        if (mobileButtons.downloadMd) {
            mobileButtons.downloadMd.addEventListener('click', () => {
                this.DownloadAs('md');
                closeMenu();
            });
        }

        if (mobileButtons.downloadTxt) {
            mobileButtons.downloadTxt.addEventListener('click', () => {
                this.DownloadAs('txt');
                closeMenu();
            });
        }

        if (mobileButtons.toggleCss) {
            mobileButtons.toggleCss.addEventListener('click', () => {
                this.ToggleCustomCSS();
                closeMenu();
            });
        }
    },

    SaveToLocalStorage: function () {
        try {
            const content = this.elements.textarea.value;
            localStorage.setItem(this.config.localStorageKey, content);
            this.state.lastSavedTime = new Date();
            this.updateAutosaveIndicator();
        } catch (err) {
            console.error("Error saving to localStorage:", err);
        }
    },

    LoadFromLocalStorage: function () {
        try {
            const savedContent = localStorage.getItem(this.config.localStorageKey);
            if (savedContent) {
                this.elements.textarea.value = savedContent;
                // We'll update the preview in Init after setting lastText
            }

            const savedStyles = localStorage.getItem('markdownEditorStyles');
            if (savedStyles && this.elements.customStyleTag) {
                const styles = JSON.parse(savedStyles);
                this.elements.fontFamilySelect.value = styles.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
                this.elements.fontSizeInput.value = parseInt(styles.fontSize) || 16;
                this.elements.textColorInput.value = styles.textColor || "#000000";
                this.elements.boldColorInput.value = styles.boldColor || "#000000";
                this.elements.italicColorInput.value = styles.italicColor || "#000000";
                this.elements.headingColorInput.value = styles.headingColor || "#000000";
                this.elements.showHeadingBorderCheckbox.checked = styles.showHeadingBorder !== undefined ? styles.showHeadingBorder : true;
                this.elements.headingBorderColorInput.value = styles.headingBorderColor || "#E5D0AC";
                this.elements.linkColorInput.value = styles.linkColor || "#0366d6";
                // Use bgColor if available, otherwise fall back to contentBgColor or paneBgColor from old versions
                this.elements.bgColorInput.value = styles.bgColor || styles.contentBgColor || styles.paneBgColor || "#FEF9E1";
                this.elements.codeTextColorInput.value = styles.codeTextColor || "#A31D1D";
                this.elements.codeBgColorInput.value = styles.codeBgColor || "#F0EADC";
                this.elements.lineHeightInput.value = styles.lineHeight || "1.6";
                
                // Apply the styles
                this.ApplyCustomCSS();
            }
        } catch (err) {
            console.error("Error loading from localStorage:", err);
        }
    },
};

document.addEventListener('DOMContentLoaded', () => {
    Editor.Init();
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        if (!Editor.state.isInitialized) {
            Editor.Init();
        }
    }, 1);
}