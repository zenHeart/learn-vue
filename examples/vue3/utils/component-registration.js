const requireComponent = path => require.context(path, false, /\.vue$/);

export mountComponent = (vue,path) => {
    let components = requireComponent(path).keys();
    components.forEach((fileName) => {
       let componentName = fileName.replace(/^\.\//,'').replace(/\.\w+$/,''))
       console.log(componentName);
    })
}