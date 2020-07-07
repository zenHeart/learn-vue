import { createTagsColor, parserHtml } from '@/common/utils'

export function mountComponents() {
  let components = [];
  const demos = require.context('./demos', true, /(?<!\/)[a-z-]+\.(vue|html)?$/)
  demos.keys().forEach(filename => {
    const componentConfig = demos(filename)
    const name = filename.replace(/^\.\//, '').replace(/.\w+$/, '');
    const component = componentConfig.default || componentConfig;

    let htmlInfo = {};
    if (typeof component === 'string') {
      htmlInfo = parserHtml(component);
    } else {
      htmlInfo = component.meta || {};
    }

    components.push({
      name,
      component,
      ...htmlInfo
    })
  })
  return components
}
export const COMPONENTS = mountComponents();
export const TAGS_COLOR = createTagsColor(COMPONENTS);

