import yaml from 'js-yaml';

export function parserHtml(content) {
  const START_YAML = '---';
  const END_YAML = '\n---\n';

  if (content.startsWith(START_YAML)) {
    let lastIndex = content.indexOf(END_YAML) + END_YAML.length;
    let yamlData = yaml.safeLoad(
      content.slice(0, lastIndex - END_YAML.length),
      'utf8'
    );
    return {
      component: content.slice(lastIndex),
      ...yamlData
    };
  }
  return { component: content };
}

import randomColor from 'randomcolor';
export function createTagsColor(navs) {
  let colors = {};
  let tags =
    new Set(
      navs
        .map((ele) => ele.tags)
        .reduce((sum, ele) => sum.concat(ele), [])
        .filter((ele) => ele)
    ) || [];
  tags.forEach((tag) => {
    colors[tag] = randomColor({
      luminosity: 'light'
    });
  });
  return colors;
}
