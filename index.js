const fetch = require("node-fetch")

const path = require("path")
const sha1 = require("sha1")
const fs = require("fs")
const sharp = require("sharp")
const express = require("express")
const app = express()
const port = process.env.PORT || 3000
fs.mkdirSync(path.resolve(__dirname,"cache"), { recursive: true } )
fs.mkdirSync(path.resolve(__dirname,"resized"), { recursive: true } )


app.get("*", async (req, res) => {
	const params = req.originalUrl.split("/")
	if (params.length > 3) {
		const width = Number(params[1]) ? Number(params[1]) : undefined
		const height = Number(params[2]) ? Number(params[2]) : undefined
		const url = params.slice(3).join("/")
        
		const  image=await	procesarImagen(url, { width, height })

		fs.readFile(path.resolve(  __dirname , image) , function (err,data){
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
				.then(x => fs.writeFileSync(path.resolve(  __dirname , fileName), Buffer.from(x)))
				.then(async () => {

					sharp(path.resolve(__dirname, fileName))
						.resize(width, height, {
							kernel:"cubic"
						})
						.toFile(path.resolve(__dirname,outputFile), (err, info) => {
							if (err) {
								reject(err)
							}
							else {
								resolve(outputFile)
							}
							
							fs.unlink(path.resolve(__dirname, fileName), () => { })
						})
				
				})
		}
		
	})
}

