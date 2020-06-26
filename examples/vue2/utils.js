import yaml from 'js-yaml'

export function parserHtml(content) {
  const START_YAML = '---';
  const END_YAML = '\n---\n';

  if (content.startsWith(START_YAML)) {

    let lastIndex = content.indexOf(END_YAML) + END_YAML.length;
    let yamlData = yaml.safeLoad(content.slice(0, lastIndex - END_YAML.length), 'utf8');
    return {
      content: content.slice(lastIndex),
      ...yamlData
    };
  }
  return { content }
}

export function mountRawHtml() {
  let rawHtmls = [];
  const htmls = require.context('./raws', false, /\w+\.html$/)
  htmls.keys().forEach(filename => {
    const componentConfig = htmls(filename)
    const name = filename.replace(/^\.\//, '').replace(/.\w+$/, '');
    const htmlStr = componentConfig.default || componentConfig;
    const htmlInfo = parserHtml(htmlStr);

    rawHtmls.push({
      name,
      ...htmlInfo
    })
  })
  return rawHtmls
}

import randomColor from "randomColor";
function createTagsColor(navs) {
  let colors = {};
  let tags =
    new Set(
      Object.keys(navs)
        .map(key => navs[key].tags)
        .reduce((sum, ele) => sum.concat(ele), [])
        .filter(ele => ele)
    ) || [];
  tags.forEach(tag => {
    colors[tag] = randomColor({
      luminosity: 'light',
    });
  });
  return colors;
};

export const NAVS = mountRawHtml();

export const TAGS_COLOR = createTagsColor(NAVS);

