const generateForm = document.querySelector(".generate-form");
const imageGallery = document.querySelector(".image-gallery");

//To create an API key, go to https://platform.openai.com/ and create an account.
//Then, after login, go to https://platform.openai.com/account/api-keys.
//Click on Create New Secret Key.
//Copy and then paste key here.
//This key will expire after sometime. For me, it expires on 1st Feb 2024

//Send a request to the OpenAI API to generate images based on user inputs
const OPENAI_API_KEY = "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";
let isImageGenerating = false;

const updateImageCard = (imgDataArray) => {
    imgDataArray.forEach((imgObject, index) => {
        const imgCard = imageGallery.querySelectorAll(".img-card")[index];
        const imgElement = imgCard.querySelector("img");
        const downloadBtn = imgCard.querySelector(".download-btn");

        //Set the image source to the AI-generated image data
        const aiGeneratedImg = `data:image/jpeg;base64,${imgObject.b64_json}`;
        imgElement.src = aiGeneratedImg;

        //When the image is loaded, remove the loading class and set download attributes
        imgElement.onload = () => {
            imgCard.classList.remove("loading");
            downloadBtn.setAttribute("href", aiGeneratedImg);
            downloadBtn.setAttribute("download", `${new Date().getTime()}.jpg`);
        }
    });
}

// OpenAI API : https://platform.openai.com/docs/api-reference/images/create
const generateAiImages = async (userPrompt, userImgQuantity) => {
    try{
        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                prompt: userPrompt,
                n: parseInt(userImgQuantity),
                size: "512x512",
                response_format: "b64_json"
            })
        });

        if(!response.ok) throw new Error("Failed to generate images! Please try again later")

        //Get data from the response
        const { data } = await response.json();
        // console.log(data);
        updateImageCard([...data]);
    } catch(error) {
        // console.log(error);
        alert(error.message);
    } finally {
        isImageGenerating = false;
    }
}

const handleFormSubmission = (e) => {
    e.preventDefault();
    // console.log(e.srcElement);
    if(isImageGenerating) return;
    isImageGenerating = true;

    //Get user input and image quantity values from the form
    const userPrompt = e.srcElement[0].value;
    const userImgQuantity = e.srcElement[1].value;

    // console.log(userPrompt, userImgQuantity);

    //Creating HTML markup for image cards with loading state
    const imgCardMarkup = Array.from({length: userImgQuantity}, () =>
        `<div class="img-card loading">
            <img src="./images/loader.svg" alt="image">
            <a href="#" class="download-btn">
                <img src="./images/download.svg" alt="download icon">
            </a>
        </div>`
    ).join("");

    // console.log(imgCardMarkup);
    imageGallery.innerHTML = imgCardMarkup;
    generateAiImages(userPrompt, userImgQuantity);

}

generateForm.addEventListener("submit", handleFormSubmission);