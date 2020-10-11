const resizeImg = require("resize-img")

const fs = require("fs")

const fileName = "cache/file2.jpg"

const a = async () => {
    
	const image = await resizeImg(fs.readFileSync(fileName), {
		width: 128,
		height: 128
	})
    
	fs.writeFileSync("chicoxd.png", image)
}
a()