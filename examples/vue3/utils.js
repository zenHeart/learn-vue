export function mountComponents() {
    let components = [];
    const htmls = require.context('./sfc', false, /\w+\.vue$/)
    htmls.keys().forEach(filename => {
        const componentConfig = htmls(filename)
        const name = filename.replace(/^\.\//, '').replace(/.\w+$/, '');
        const component = componentConfig.default || componentConfig;

        components.push({
            name,
            component
        })
    })
    return components
}



export const COMPONENTS = mountComponents();

