const defaultCallback = (err, response) => {
    if (err) {
        throw err
    } else {
        console.log('defaultCallback()')
        console.log('response')
        console.log(response)
    }
}

class HtmlServiceClientRun {
    successHandler = defaultCallback
    failureHandler = defaultCallback
    userObject = undefined
    
    withSuccessHandler(callback) {
        this.successHandler = callback
        return this
    }

    withFailureHandler(callback) {
        this.failureHandler = callback
        return this
    }

    withUserObject(object) {
        this.userObject = object
        return this
    }

    async getUserData() {
        const { default: userData } = await import('../../data/userData')
        console.log(
            'mockHttpService.getUserData()',
            'userData',
            userData,
        )
        this.successHandler(userData)
    }

    async getAndCacheListData() {
        const { default: listData } = await import('../../data/listData.json')
        console.log(
            'mockHttpService.getAndCacheListData()',
            'listData',
            listData,
        )
        
        this.successHandler(listData)
    }

    logClick(id, header) {
        console.log(
            'mockHttpService.lockClick()',
            'id',
            id,
            'header',
            header
        )
    }

}

class HtmlServiceClientScript {
    run = new HtmlServiceClientRun()
}

class HtmlServiceClient {
    get script() {
        return new HtmlServiceClientScript()
    }
}

const client = new HtmlServiceClient()
console.log('Mock client initialized', client)

export default client

/**
 * google.script.run.withSuccessHandler(onSuccess).withFailureHandler(onFailure)
                if (userObject) script.withUserObject(userObject)
                script[scriptName](...args)
 */
