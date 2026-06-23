
// all possible State Path Routes
let rawStatePathRoutes = [
    'do-you-know-which-license-you-need/yes/which-license-do-you-need/cc-0/waive-your-copyright+waive+read-elect/(attribution-details)&tool=cc-0',
    'do-you-know-which-license-you-need/yes/which-license-do-you-need/cc-by/(attribution-details)&tool=cc-by',
    'do-you-know-which-license-you-need/yes/which-license-do-you-need/cc-by-sa/(attribution-details)&tool=cc-by-sa',
    'do-you-know-which-license-you-need/yes/which-license-do-you-need/cc-by-nd/(attribution-details)&tool=cc-by-nd',
    'do-you-know-which-license-you-need/yes/which-license-do-you-need/cc-by-nc/(attribution-details)&tool=cc-by-nc',
    'do-you-know-which-license-you-need/yes/which-license-do-you-need/cc-by-nc-sa/(attribution-details)&tool=cc-by-nc-sa',
    'do-you-know-which-license-you-need/yes/which-license-do-you-need/cc-by-nc-nd/(attribution-details)&tool=cc-by-nc-nd',
    
    'do-you-know-which-license-you-need/no/require-attribution/yes/allow-commercial-use/yes/allow-derivatives/yes/share-alike/no/confirmation+ownership+read+revocation/(attribution-details)&tool=cc-by',
    'do-you-know-which-license-you-need/no/require-attribution/yes/allow-commercial-use/yes/allow-derivatives/yes/share-alike/yes/confirmation+ownership+read+revocation/(attribution-details)&tool=cc-by-sa',
    'do-you-know-which-license-you-need/no/require-attribution/yes/allow-commercial-use/yes/allow-derivatives/no/confirmation+ownership+read+revocation/(attribution-details)&tool=cc-by-nd',
    'do-you-know-which-license-you-need/no/require-attribution/yes/allow-commercial-use/no/allow-derivatives/yes/share-alike/no/confirmation+ownership+read+revocation/(attribution-details)&tool=cc-by-nc',
    'do-you-know-which-license-you-need/no/require-attribution/yes/allow-commercial-use/no/allow-derivatives/yes/share-alike/yes/confirmation+ownership+read+revocation/(attribution-details)&tool=cc-by-nc-sa',
    'do-you-know-which-license-you-need/no/require-attribution/yes/allow-commercial-use/no/allow-derivatives/no/confirmation+ownership+read+revocation/(attribution-details)&tool=cc-by-nc-nd',
    'do-you-know-which-license-you-need/no/require-attribution/no/waive-your-copyright+waive+read-elect/(attribution-details)&tool=cc-0'
];

// empty state obj
let state = {};

// all found fieldsets
const fieldsets = document.querySelectorAll('fieldset'); 

// all found toggles
const toggles = document.querySelectorAll('#mark-your-work footer input');

// all found copiers
const copiers = document.querySelectorAll('#mark-your-work footer button');

// empty defaults obj
let applyDefaults = {};

// set elemnts which need defaults
// on initial page load
applyDefaults.elements = [
    '#require-attribution',
    '#allow-commercial-use',
    '#allow-derivatives',
    '#share-alike',
    '#waive-your-copyright',
    '#confirmation'
];

// function to parse and build state.possibilities
// from rawStatePathRoutes
function setStatePossibilities(state) {

    // create state possibilities from possible tools with adjoining statePaths
    state.possibilities = [];
    rawStatePathRoutes.forEach((path, index) => {

        statePath = path.split("&");
        statepath = statePath;
        tool = statePath[statePath.length - 1].split("=");
        tool = tool[1];

        regEx = /\(([^)]+)\)/g;
        optionals = statePath[0].match(regEx);

        optionals.forEach ((optional) => {

            noOptionalsPath = statePath[0].replace(optional,'');

        });

        fullPath = statePath[0].replace(/[{()}]/g, '') + '/';
    
        if (state.possibilities[tool] == undefined) {
            state.possibilities[tool] = [];
        }
        state.possibilities[tool].push(fullPath);
        state.possibilities[tool].push(noOptionalsPath);
        
    });
}

// function to establish state.parts
function setStateParts(state) {
    state.parts = [];

    // temp defaults
    state.parts[0] = 'do-you-know-which-license-you-need/yes/';
    state.parts[8] = 'attribution-details/';
}
// function to update state.parts
function updateStateParts(element, index, event, state) {

    state.parts[index] = element.id + '/' + event.target.value + '/';

    // check if checkbox, with siblings
    if (event.target.getAttribute('type') == 'checkbox') {        
        let checkboxElements = element.querySelectorAll('input[type="checkbox"]');
        let checkboxes = [];
        checkboxElements.forEach((checkbox, index) => { 
            if (checkbox.checked) {
                checkboxes[index] = checkbox.value;
            }
        });


        let joinedCheckboxes = checkboxes.filter(Boolean).join('+');

        state.parts[index] = element.id + '+' + joinedCheckboxes + '/';;
    }

    // check if text input
    if (event.target.getAttribute('type') == 'text') {

        state.parts[index] = element.id + '/';

    }
}

// function to combine current tracked 
// state.parts into state.current
function setStateCurrent(element, index,  state) {
    state.parts.forEach((element, i) => {
        if (i > index) {
            state.parts.splice(i);  
        }
    });
    
    state.current = state.parts.join('') //.slice(0, -1);
}

// function to set state.props
// including setting state.props.tool (if valid)
// or error
function setStateProps(index, state) {

    state.props = {};
    state.props.tool = 'unknown';

    // check and match possibilities
    Object.keys(state.possibilities).forEach((possibility) => {
        if(state.possibilities[possibility].includes(state.current)) {
            state.props.tool = possibility;
        }
    });

    // set toolFull, toolShort, toolURL
    if (state.props.tool != 'unknown' && state.props.tool != 'cc-0' ) { // was OR, changes to AND

        formattedTool = state.props.tool.replace(/-/, ' ').toUpperCase();
        state.props.toolShort = formattedTool + ' 4.0';

        // set shortName
        shortName = state.props.tool.replace(/cc-/, '');
        state.props.toolURL = 'https://creativecommons.org/licenses/' + shortName + '/4.0/deed.ja'; 
    }

    if (state.props.tool != 'unknown' ) {
        //set longName
        let tool = state.props.tool;
        let template = document.getElementById(tool);
        let templateContent = template.content.cloneNode(true);
        state.props.toolLong = templateContent.querySelector('header h4').textContent;
    }

    if (state.props.tool == 'cc-0') {

        state.props.toolShort = 'CC0 1.0';

        // set toolFull
        state.props.toolURL = 'https://creativecommons.org/publicdomain/zero/1.0/deed.ja';
    }

    state.props.cursor = index;

    state.props.attribution = [];
    setStatePropsAttribution(state);
}

// function to just set the attribution 
// subset of state.props (for use other places)
function setStatePropsAttribution(state) {

    if (document.querySelector('#attribution-details #title').value == '') {
        state.props.attribution.title = document.querySelector('#attribution-details #title').placeholder.replace(/(<([^>]+)>)/gi, "");
    } else {
        state.props.attribution.title = document.querySelector('#attribution-details #title').value.replace(/(<([^>]+)>)/gi, "");
    }

    if (document.querySelector('#attribution-details #creator').value == '') {
        state.props.attribution.creator = document.querySelector('#attribution-details #creator').placeholder.replace(/(<([^>]+)>)/gi, "");
    } else {
        state.props.attribution.creator = document.querySelector('#attribution-details #creator').value.replace(/(<([^>]+)>)/gi, "");
    }

    if (document.querySelector('#attribution-details #work-link').value == '') {
        state.props.attribution.workLink = document.querySelector('#attribution-details #work-link').placeholder.replace(/(<([^>]+)>)/gi, "");
    } else {
        state.props.attribution.workLink = document.querySelector('#attribution-details #work-link').value.replace(/(<([^>]+)>)/gi, "");
    }

    if (document.querySelector('#attribution-details #creator-link').value == '') {
        state.props.attribution.creatorLink = document.querySelector('#attribution-details #creator-link').placeholder.replace(/(<([^>]+)>)/gi, "");
    } else {
        state.props.attribution.creatorLink = document.querySelector('#attribution-details #creator-link').value.replace(/(<([^>]+)>)/gi, "");
    }

    if (document.querySelector('#attribution-details #work-creation-year').value == '') {
        state.props.attribution.workCreationYear = document.querySelector('#attribution-details #work-creation-year').placeholder.replace(/(<([^>]+)>)/gi, "");
    } else {
        state.props.attribution.workCreationYear = document.querySelector('#attribution-details #work-creation-year').value.replace(/(<([^>]+)>)/gi, "");
    }
}

// function to reset values beyond current fieldset
// [T]: this could potentially do with a refactor
// check for input type, and them perform 
// contextual resets to universal defaults
// unchecked for radio/checkbox, noselect for 
// selection dropdown, etc.
function clearStepsAfterCursor(fieldsets, state) {
    fieldsets.forEach((element, index) => {
        if (index > state.props.cursor) {

            if (index == 1) {
                element.querySelector("#tool").value = "noselect";
            }

            if (index !== 1 && index !== 8) {

                let inputs = element.querySelectorAll('input');
                inputs.forEach((input, i) => {
                    input.checked = false;
                });
            }
        }
    });
}

// function to build Creative Commons icon markup
function buildCCIconHTML(iconName) {
  const iconStyle = 'height:22px!important;margin-right:0.35rem;vertical-align:text-bottom;';
  const iconBaseURL = 'https://mirrors.creativecommons.org/presskit/icons/';

  return (
    '<img class="cc-license-icon" style="' +
    iconStyle +
    '" src="' +
    iconBaseURL +
    iconName +
    '.svg?ref=chooser-v1" alt="" aria-hidden="true">'
  );
}

// function to build icon set for each selected license
function buildToolIconSetHTML(tool) {
  switch (tool) {
    case 'cc-0':
      return buildCCIconHTML('cc') + buildCCIconHTML('zero');

    case 'cc-by':
      return buildCCIconHTML('cc') + buildCCIconHTML('by');

    case 'cc-by-sa':
      return buildCCIconHTML('cc') + buildCCIconHTML('by') + buildCCIconHTML('sa');

    case 'cc-by-nd':
      return buildCCIconHTML('cc') + buildCCIconHTML('by') + buildCCIconHTML('nd');

    case 'cc-by-nc':
      return buildCCIconHTML('cc') + buildCCIconHTML('by') + buildCCIconHTML('nc');

    case 'cc-by-nc-sa':
      return buildCCIconHTML('cc') + buildCCIconHTML('by') + buildCCIconHTML('nc') + buildCCIconHTML('sa');

    case 'cc-by-nc-nd':
      return buildCCIconHTML('cc') + buildCCIconHTML('by') + buildCCIconHTML('nc') + buildCCIconHTML('nd');

    default:
      return '';
  }
}

// function to add icons inside the recommendation card
function enhanceRecommendationIcons(container, tool) {
  if (!container) {
    return;
  }

  const header = container.querySelector('header');

  if (header && !header.querySelector('.recommendation-icons')) {
    const iconRow = document.createElement('span');
    iconRow.className = 'recommendation-icons';
    iconRow.setAttribute('aria-hidden', 'true');
    iconRow.innerHTML = buildToolIconSetHTML(tool);

    const title = header.querySelector('h3');

    if (title) {
      header.insertBefore(iconRow, title);
    } else {
      header.insertBefore(iconRow, header.firstChild);
    }
  }

  const conditionIconMap = {
    'CC0': 'zero',
    'BY': 'by',
    'NC': 'nc',
    'SA': 'sa',
    'ND': 'nd'
  };

  container.querySelectorAll('dt').forEach((term) => {
    const label = term.textContent.trim();

    if (conditionIconMap[label] && !term.querySelector('img')) {
      term.insertAdjacentHTML('afterbegin', buildCCIconHTML(conditionIconMap[label]));
    }
  });
}

// function to render "tool recommendation",
// if valid tool from state.parts and/or state.current
function renderToolRec(state) {
  const recommendation = document.querySelector('#tool-recommendation');
  const recommendationTool = document.querySelector('#tool-recommendation .tool');

  if (state.props.tool != 'unknown') {
    recommendation.classList.remove('disable');

    let tool = state.props.tool;
    let template = document.getElementById(tool);
    let templateContent = template.content.cloneNode(true);

    recommendationTool.textContent = '';
    recommendationTool.appendChild(templateContent);

    enhanceRecommendationIcons(recommendationTool, tool);
  } else if (state.props.tool == 'unknown') {
    recommendation.classList.add('disable');
    recommendationTool.textContent = '';
  }
}

// render specifically the mark formats subsections
function renderMarkingFormats(state) {

    if (state.props.tool != 'unknown' ) {}

    setStatePropsAttribution(state);

    let attribution = state.props.attribution;

    let type = "ライセンス";
    let typeAsVerb = "基づきライセンス";
    let copyright = "";

    if (attribution.workCreationYear != "" && attribution.workCreationYear != "1999") {
      copyright = "（© " + attribution.workCreationYear + "）";
    }

    if (state.props.tool == "cc-0") {
      type = "法的ツール";
      typeAsVerb = "よりパブリックドメイン提供として表示";
      copyright = "";
    }

    // set contents of plain text mark
    // [T]: reverse use of <template> since it has limits on tokenization capacity, even if
    // it allows more dev readability.

    // determine if generic mark is toggled.
    plainTextGenericMark = document.querySelector('#plain-text-generic-mark').checked;

    if (plainTextGenericMark == true) {
        template = document.getElementById('plain-text-generic');
        console.log('plain text generic mark true');
    } else {
        template = document.getElementById('plain-text');
        console.log('plain text generic mark false');
    }

    templateContent = template.content.cloneNode(true);
    document.querySelector('#mark-your-work .plain-text.mark').textContent = '';

    function parseTokens(name, value, str){
        return str.replaceAll("{{"+name+"}}", value);
    }

    let markProps = {};
    markProps.title = attribution.title;
    markProps.year = attribution.workCreationYear;
    markProps.creator = attribution.creator;
    markProps.type = type;
    markProps.typeAsVerb = typeAsVerb;
    markProps.toolShort = state.props.toolShort;
    markProps.toolLong = state.props.toolLong;
    markProps.toolURL = state.props.toolURL;
    markProps.copyright = copyright;

    // set contents of plain text mark
    plainTextFullName = document.querySelector('#plain-text-full-name').checked;

    if (plainTextFullName == true) {
        markProps.toolName = state.props.toolLong;
    } else {
        markProps.toolName = state.props.toolShort;
    }

    // [T]: could carve out separate sections for different mark formats here
    // only handles plain text at the moment
    for (const [key, value] of Object.entries(markProps)) {
        templateContent.textContent = parseTokens(key, value, templateContent.textContent);
    }
    document.querySelector('#mark-your-work .plain-text.mark').appendChild(templateContent);

    // set contents of rich text mark
    let iconStyle = 'height:22px!important;margin-left:3px;vertical-align:text-bottom;';
    let iconBaseURL = 'https://mirrors.creativecommons.org/presskit/icons/';

    let ccSVG =
      '<img style="' +
      iconStyle +
      '" src="' +
      iconBaseURL +
      'cc.svg?ref=chooser-v1" alt="" aria-hidden="true">';

    let bySVG =
      '<img style="' +
      iconStyle +
     '" src="' +
      iconBaseURL +
      'by.svg?ref=chooser-v1" alt="" aria-hidden="true">';

    let saSVG =
      '<img style="' +
      iconStyle +
      '" src="' +
      iconBaseURL +
      'sa.svg?ref=chooser-v1" alt="" aria-hidden="true">';

    let ncSVG =
      '<img style="' +
      iconStyle +
      '" src="' +
      iconBaseURL +
      'nc.svg?ref=chooser-v1" alt="" aria-hidden="true">';

    let ndSVG =
      '<img style="' +
      iconStyle +
      '" src="' +
      iconBaseURL +
      'nd.svg?ref=chooser-v1" alt="" aria-hidden="true">';

    let zeroSVG =
      '<img style="' +
      iconStyle +
      '" src="' +
      iconBaseURL +
      'zero.svg?ref=chooser-v1" alt="" aria-hidden="true">';

    let ccIconSet = '';
    const currentTool = state.props.tool;

    switch (currentTool) {
      case 'cc-0':
        ccIconSet = ccSVG + zeroSVG;
        break;

      case 'cc-by':
        ccIconSet = ccSVG + bySVG;
        break;

      case 'cc-by-sa':
        ccIconSet = ccSVG + bySVG + saSVG;
        break;

      case 'cc-by-nd':
        ccIconSet = ccSVG + bySVG + ndSVG;
        break;

      case 'cc-by-nc':
        ccIconSet = ccSVG + bySVG + ncSVG;
        break;

      case 'cc-by-nc-sa':
        ccIconSet = ccSVG + bySVG + ncSVG + saSVG;
        break;

      case 'cc-by-nc-nd':
        ccIconSet = ccSVG + bySVG + ncSVG + ndSVG;
        break;

      default:
        ccIconSet = '';
    }
    
richTextFullName = document.querySelector('#rich-text-full-name').checked;

if (richTextFullName == true) {
  markProps.toolName = state.props.toolLong;
} else {
  markProps.toolName = state.props.toolShort;
}

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function safeURL(value) {
  const url = String(value ?? '').trim();

  if (!isValidURL(url)) {
    return '';
  }

  return url;
}

function linkedText(text, url, attributes = '') {
  const escapedText = escapeHTML(text);
  const href = safeURL(url);

  if (href == '') {
    return escapedText;
  }

  return '<a href="' + escapeHTML(href) + '"' + attributes + '>' + escapedText + '</a>';
}

function licenseLink(toolName) {
  return linkedText(toolName, state.props.toolURL, ' rel="license"');
}

function workTitleLink() {
  return linkedText('「' + attribution.title + '」', attribution.workLink);
}

function creatorNameLink() {
  return linkedText(attribution.creator, attribution.creatorLink);
}

function buildAttributionHTML(toolName, genericMark) {
  const linkedLicense = licenseLink(toolName);

  if (genericMark == true) {
    return (
      'この作品は、' +
      linkedLicense +
      'に' +
      typeAsVerb +
      'されています。' +
      ccIconSet
    );
  }

  return (
    creatorNameLink() +
    'による' +
    workTitleLink() +
    copyright +
    'は、' +
    linkedLicense +
    'に' +
    typeAsVerb +
    'されています。' +
    ccIconSet
  );
}

// determine if generic mark is toggled.
richTextGenericMark = document.querySelector('#rich-text-generic-mark').checked;
richTextMark = buildAttributionHTML(markProps.toolName, richTextGenericMark);

if (richTextGenericMark == true) {
  console.log('rich text generic mark true');
} else {
  console.log('rich text generic mark false');
}

document.querySelector('#mark-your-work .rich-text.mark').innerHTML = richTextMark;

// set contents of HTML mark
htmlFullName = document.querySelector('#html-full-name').checked;

if (htmlFullName == true) {
  markProps.toolName = state.props.toolLong;
} else {
  markProps.toolName = state.props.toolShort;
}

// determine if generic mark is toggled.
htmlGenericMark = document.querySelector('#html-generic-mark').checked;
htmlMark = buildAttributionHTML(markProps.toolName, htmlGenericMark);

if (htmlGenericMark == true) {
  console.log('html generic mark true');
} else {
  console.log('html generic mark false');
}

document.querySelector('#mark-your-work .html.mark').value = htmlMark;
}


// function to replace placeholders with values 
// for mark format constriction
// lots of TODOs here (just for testing)
// can use this to build out string replacement when
// swapping in html from a <template> element
// this will enable, controlling the markup, in markup
// and then JS is only having to do logic replacement
// of the token placeholders, rather than storing strings 
// within the JS unnecessarily.


// function parseTokens(name, value, str){
//     return str.replaceAll("{{"+name+"}}", value);
// }
  
//   const mark = 'test {{title}} {{year}} by {{author}}';

//   parsedMark = parseTokens("year", "2025", mark);
//   parsedMark = parseTokens("title", "cool work", parsedMark);
//   parsedMark = parseTokens("author", "jane mayer", parsedMark);
//   console.log(parsedMark);



// function to render "empty area"
// if no valid tool from state.parts and/or state/current
function renderEmptyPlaceholder(state) { 

    if (state.props.tool == 'unknown' ) {
        document.querySelector('#empty').classList.remove('disable');
    }
    
    else if (state.props.tool != 'unknown') {
        document.querySelector('#empty').classList.add('disable');
    }
    
}

// function to render "mark your work",
// if valid tool from state.parts and/or state.current
// if attribution details input(s) filled out
function renderMarkYourWork(state) {
    if (state.props.tool != 'unknown' ) {
        // load attribution details template, 
        // populate from attribution text values
        document.querySelector('#mark-your-work').classList.remove('disable');
        
        renderMarkingFormats(state);

    }
    
    else if (state.props.tool == 'unknown') {
        document.querySelector('#mark-your-work').classList.add('disable');
    }

}

// function to set default UX states on Steps
// set default visibly disabled pathways

function setDefaults(applyDefaults) {

    applyDefaults.elements.forEach((element) => {
        document.querySelector(element).classList.toggle('disable');
    });

    if (state.parts[0] == 'do-you-know-which-license-you-need/yes/' ) {
        applyDefaults.elements.forEach((element) => {
            document.querySelector(element).classList.add('disable');
        });
    }

    document.querySelector('#tool-recommendation').classList.add('disable');
    document.querySelector('#mark-your-work').classList.add('disable');
    document.querySelector('#tool-rec-details').classList.add('hide');
}

// stepper logic here for what parts of form are 
// displayed/hidden, as state.parts and state.current 
// are updated
function renderSteps(applyDefaults, state) {

    // check if visitor needs help, start help pathways
    if (state.current == 'do-you-know-which-license-you-need/no/' ) {

        applyDefaults.elements.forEach((element) => {
            document.querySelector(element).classList.remove('disable');
        });
        document.querySelector('#which-license-do-you-need').classList.toggle('disable');
        document.querySelector('#waive-your-copyright').classList.add('disable');
            
    }

    // if visitor doesn't need help
    if (state.current == 'do-you-know-which-license-you-need/yes/' ) {

        applyDefaults.elements.forEach((element) => {
            document.querySelector(element).classList.add('disable');
        });
        document.querySelector('#which-license-do-you-need').classList.toggle('disable');
        document.querySelector('#waive-your-copyright').classList.add('disable');

    }

    // check if cc0
    if (state.parts[2] == 'require-attribution/no/' || state.parts[1] == 'which-license-do-you-need/cc-0/' ) {

        applyDefaults.elements.forEach((element) => {
            document.querySelector(element).classList.add('disable');
        });

        document.querySelector('#waive-your-copyright').classList.remove('disable');
    
    } else {
        document.querySelector('#waive-your-copyright').classList.add('disable');
    }
    if (state.parts[2] == 'require-attribution/no/') {
        document.querySelector('#require-attribution').classList.remove('disable');
    }

    // walk away from cc-0, reset attribution choice point
    if (state.parts[2] == 'require-attribution/yes/') {
        applyDefaults.elements.forEach((element) => {
            document.querySelector(element).classList.remove('disable');
        });
        document.querySelector('#require-attribution').classList.remove('disable');
        document.querySelector('#waive-your-copyright').classList.add('disable');
    }

    // tie SA to ND choice
    if (state.parts[4] == 'allow-derivatives/no/') {
        document.querySelector('#share-alike').classList.add('disable');
    }
    
}

// [T]: function to handle error state

// function to watch for fieldset changes 
function watchFieldsets(fieldsets, state) {
    fieldsets.forEach((element, index) => {

        // [T]: set defaults here first in state.parts dynamically

        element.addEventListener("change", (event) => {

            updateStateParts(element, index, event, state);

            setStateCurrent(element, index, state);

            setStateProps(index, state);

            // [T]: also reset values beyond current changed fieldset to nothing each time
            clearStepsAfterCursor(fieldsets, state);

            renderSteps(applyDefaults, state);

            renderEmptyPlaceholder(state);

            renderToolRec(state);

            renderMarkYourWork(state);

        });

    });
}

// Validates URL format (http/https required)
function isValidURL(url) {
    if (!url || url.trim() === '') return true;
    const urlPattern = /^https?:\/\/.+\..+/i;
    return urlPattern.test(url);
}

// Validates year is 4 digits and not in the future
function isValidYear(year) {
    if (!year || year.trim() === '') return true;
    const yearPattern = /^\d{4}$/;
    if (!yearPattern.test(year)) return false;
    const yearNum = parseInt(year, 10);
    const currentYear = new Date().getFullYear();
    return yearNum >= 1000 && yearNum <= currentYear + 5;
}

// Displays error message below input field
function showError(input, message) {
  clearError(input);

  input.classList.add('input-error');
  input.setAttribute('aria-invalid', 'true');

  const errorDiv = document.createElement('div');
  const errorId = input.id + '-error';

  errorDiv.id = errorId;
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  errorDiv.setAttribute('role', 'alert');

  input.setAttribute('aria-describedby', errorId);
  input.parentNode.insertBefore(errorDiv, input.nextSibling);
}

// Removes error message and styling from input
function clearError(input) {
  input.classList.remove('input-error');
  input.removeAttribute('aria-invalid');
  input.removeAttribute('aria-describedby');

  const errorElement = document.getElementById(input.id + '-error');

  if (errorElement) {
    errorElement.remove();
  }
}

// Validates individual input based on field type
function validateInput(input) {
  const inputId = input.id;
  const value = input.value.trim();

  clearError(input);

  if (value === '') {
    return true;
  }

  switch (inputId) {
    case 'work-link':
      if (!isValidURL(value)) {
        showError(input, '作品へのリンクは、http:// または https:// で始まるURLで入力してください。例：https://example.com');
        return false;
      }
      break;

    case 'creator-link':
      if (!isValidURL(value)) {
        showError(input, 'クリエイターのプロフィールへのリンクは、http:// または https:// で始まるURLで入力してください。例：https://example.com/profile');
        return false;
      }
      break;

    case 'work-creation-year':
      if (!isValidYear(value)) {
        const currentYear = new Date().getFullYear();

        showError(input, '作成年は、1000年から' + (currentYear + 5) + '年までの4桁の年で入力してください。例：' + currentYear);
        return false;
      }
      break;
  }

  return true;
}

// Validates all attribution detail inputs at once
function validateAllAttributionInputs() {
    const inputs = document.querySelectorAll('#attribution-details input[type="text"]');
    let allValid = true;
    inputs.forEach(input => {
        if (!validateInput(input)) {
            allValid = false;
        }
    });
    return allValid;
}

// Watches attribution detail inputs for validation
function watchAttributionDetails(fieldsets, state) {
    let textFields = fieldsets[8].querySelectorAll('input');

    textFields.forEach((element, index) => {
        element.addEventListener("blur", (event) => {
            validateInput(element);
        });
        
        element.addEventListener("keyup", (event) => {
            if (element.classList.contains('input-error')) {
                validateInput(element);
            }
            renderMarkingFormats(state);
        });
    });
}

function watchMarkToggles(toggles, state) {

    toggles.forEach((element, index) => {

        element.addEventListener("click", (event) => {
            renderMarkingFormats(state);
        });

    });
}

function watchMarkCopiers(copiers, state) {
  function getMarkText(button) {
    const formatBlock = button.closest('details.format');
    const mark = formatBlock ? formatBlock.querySelector('.mark') : button.parentNode.parentNode.querySelector('.mark');

    if (!mark) {
      return '';
    }

    if (mark.value != null) {
      return mark.value;
    }

    return mark.innerHTML;
  }

  function getCopyStatus(button) {
    let status = button.parentNode.querySelector('.copy-status');

    if (!status) {
      status = document.createElement('span');
      status.className = 'copy-status';
      status.setAttribute('aria-live', 'polite');
      status.setAttribute('role', 'status');
      button.parentNode.appendChild(status);
    }

    return status;
  }

  function setCopyStatus(button, message) {
    const status = getCopyStatus(button);

    status.textContent = message;

    if (button.copyStatusTimer) {
      window.clearTimeout(button.copyStatusTimer);
    }

    button.copyStatusTimer = window.setTimeout(() => {
      status.textContent = '';
    }, 2500);
  }

  function fallbackCopyToClipboard(text) {
    const temp = document.createElement('textarea');

    temp.value = text;
    temp.setAttribute('readonly', '');
    temp.style.position = 'fixed';
    temp.style.top = '-9999px';
    temp.style.left = '-9999px';

    document.body.appendChild(temp);
    temp.select();

    const success = document.execCommand('copy');

    document.body.removeChild(temp);

    return success;
  }

  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    return fallbackCopyToClipboard(text);
  }

  copiers.forEach((element, index) => {
    element.addEventListener('click', async (event) => {
      const text = getMarkText(element);

      if (text == '') {
        setCopyStatus(element, 'コピーする内容がありません。');
        return;
      }

      try {
        await copyToClipboard(text);
        setCopyStatus(element, 'コピーしました。');
      } catch (error) {
        setCopyStatus(element, 'コピーできませんでした。手動で選択してコピーしてください。');
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", (event) => {
    // full flow logic 
    setStateParts(state);

    setStatePossibilities(state);

    setDefaults(applyDefaults);

    setStateProps(0, state);

    watchFieldsets(fieldsets, state);
    watchAttributionDetails(fieldsets, state);
    watchMarkToggles(toggles, state);
    watchMarkCopiers(copiers, state);
});

// rough panel expansion test
// let expandButtons = document.querySelectorAll('button.expandPanel');

// expandButtons.forEach((element, index) => { 
//     element.addEventListener("click", (event) => {

//         parent = event.target.parentNode.parentNode;
//         parent.querySelector('.panel').classList.toggle('expand');
    
//     });
// });
