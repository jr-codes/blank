{
    function include(asset, type) {
        return asset.includes('//') ? includeFromURL(asset, type) : includeFromCDN(asset)
    }

    function includeFromCDN(library) {
        return includeFromURL(`https://unpkg.com/${library}`, 'js')
    }

    function includeFromURL(url, type = url.split('.').pop().toLowerCase()) {
        return new Promise((resolve, reject) => {
            let element

            if (type === 'css') {
                element = document.createElement('link')
                element.rel = 'stylesheet'
                element.href = url
            } else if (type === 'js') {
                element = document.createElement('script')
                element.src = url
                element.async = false
            } else {
                throw new Error(`Failed to include ${url} due to unknown file type.`)
            }

            element.onload = resolve
            element.onerror = reject
            document.head.appendChild(element)
        }).then(() => console.log('Loaded', url))
    }

    window.blank = {
        include
    }

    document.designMode = 'on'
}
