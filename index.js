const fetch = require("node-fetch")

const sha1 = require("sha1")
const fs = require("fs")
const resizeImg = require("resize-img")
const express = require("express")
const app = express()
const port = 80
const {promisify} = require("util")
const writeFilePromise = promisify(fs.writeFile)

app.get("*", async (req, res) => {
	const params = req.originalUrl.split("/")
	if (params.length > 3) {
		const width = Number(params[1]) ? Number(params[1]) : undefined
		const height = Number(params[2]) ? Number(params[2]) : undefined
		const url = params.slice(3).join("/")
        
		const  image=await	procesarImagen(url, { width, height })

		fs.readFile(image , function (err,data){
			res.contentType("image/jpg")
			res.send(data)
		})
		
	}
	else {
		res.end("Invalid parameters")
	}

})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})


const procesarImagen = (url, { width, height }) => {
	return new Promise((resolve, reject) => {
		
		const hash = sha1(JSON.stringify({ url, width, height }))
		const fileName = "cache/" + hash + ".jpg"
		const outputFile = "resized/"+hash+".jpg"
		
		if (fs.existsSync(outputFile))
		{
			
			resolve(outputFile)
		}

		else {
			
			fetch(url)
				.then(x => x.arrayBuffer())
				.then(x => writeFilePromise(fileName, Buffer.from(x)))
				.then(async () => {
					const image = await resizeImg(fs.readFileSync(fileName), {
						width,
						height
					})
					fs.writeFileSync(outputFile, image)
					fs.unlink(fileName, () => { })
					resolve(outputFile)
				})
		}
		
	})
}

