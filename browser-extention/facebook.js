var lineIndex = 0;
var intervalId = 0;

var skipInput;

function scheduleDeleteTimeline() {
    clearInterval(intervalId);
    
    setSkip(0);
    
    intervalId = setInterval(deleteTimeline, 1*1000);

}

function deleteTimeline() {
    var actionOptionsList = document.querySelectorAll("[aria-label='More options']");
    var ActionOptions = actionOptionsList[lineIndex];

    if(ActionOptions) {
        ActionOptions.click();
        setStatus(`Clicked More options for item #${lineIndex}`);
        setTimeout(chooseMenuOption, 400); // Increased timeout for menu to appear
    } else {
        setStatus("No more items found. Stopping.");
        clearInterval(intervalId);
    }
}

function chooseMenuOption(retryDelete) {
    // Priority: Delete > Unlike > Remove Reaction > Hide from profile
    let menuOptionTexts = ["Delete", "Unlike", "Remove Reaction", "Hide from profile"];
    var menuOption = null;
    var chosenOption = null;

    for(var i = 0; i < menuOptionTexts.length; i++) {
        menuOption = document.evaluate("//span[contains(text(), '" + menuOptionTexts[i] + "')]",
            document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if(menuOption != null) {
            chosenOption = menuOptionTexts[i];
            setStatus(`Found menu option: ${menuOptionTexts[i]}`);
            break;
        }
    }

    if(menuOption != null) {
        menuOption.click();
        setStatus(`Clicked menu option: ${chosenOption}`);
        // If we clicked Hide from profile, try to click Delete again after a short delay
        if(chosenOption === "Hide from profile" && !retryDelete) {
            setTimeout(function() {
                // Re-open the menu and try Delete
                var actionOptionsList = document.querySelectorAll("[aria-label='More options']");
                var ActionOptions = actionOptionsList[lineIndex];
                if(ActionOptions) {
                    ActionOptions.click();
                    setTimeout(function() { chooseMenuOption(true); }, 400);
                } else {
                    setStatus("No more items found after Hide from profile. Stopping.");
                    clearInterval(intervalId);
                }
            }, 800);
        } else {
            setTimeout(clickConfirm, 400);
        }
    } else {
        setStatus("No action found, skipping to next item.");
        lineIndex++;
        setSkip(lineIndex);
        setTimeout(deleteTimeline, 800);
    }
}

function clickConfirm() {
    // Try to find the confirmation button in the popup dialog
    let clickConfirmOptions = ["Delete", "Move to Trash", "Remove", "Unlike"];
    let item = null;
    // Try to find a visible button with the text (works for Facebook popups)
    for(var i = 0; i < clickConfirmOptions.length; i++) {
        // Try aria-label first
        item = document.querySelector("[aria-hidden='false'] [aria-label='" + clickConfirmOptions[i] + "']");
        if(!item) {
            // Try button text as fallback (for popups with visible text)
            item = Array.from(document.querySelectorAll("[aria-hidden='false'] button, [role='dialog'] button")).find(btn => btn.innerText && btn.innerText.trim() === clickConfirmOptions[i]);
        }
        if(item != null) {
            setStatus(`Confirming: ${clickConfirmOptions[i]}`);
            break;
        }
    }

    if(item != null) {
        item.click();
        setStatus("Action confirmed. Moving to next item.");
        lineIndex++;
        setSkip(lineIndex);
        setTimeout(deleteTimeline, 1200);
    } else {
        setStatus("No confirm button found, skipping to next item.");
        document.body.click(); // Close menu
        lineIndex++;
        setSkip(lineIndex);
        setTimeout(deleteTimeline, 800);
    }
}

function clearStatus() {
    var textarea = document.getElementById("cleanerstatus");
    textarea.value = "";
}

function setStatus(status) {
    var textarea = document.getElementById("cleanerstatus");
    textarea.value = status + "\n" + textarea.value;
}

function setSkip(newSkip) {
    lineIndex = newSkip;
    let skipNumber = parseInt(newSkip);
    if(isNaN(skipNumber)) {
        skipNumber = 0;
    }

    lineIndex = skipNumber;
    skipInput.value = lineIndex;

    setStatus("Updating Skip Value to " + lineIndex);
}

function createUI() {
    var buttonContainer = document.createElement("div");
    buttonContainer.style.position = "fixed";
    buttonContainer.style.margin = "10px";
    buttonContainer.style.zIndex = "10000";
    buttonContainer.style.top = "0";
    buttonContainer.style.height = "30px";
    buttonContainer.style.width = "450px"
    buttonContainer.style.left = "100px";
    buttonContainer.style.backgroundColor = "powderblue";
    buttonContainer.style.border = "darkgrey solid 1px";
    buttonContainer.style.overflow = "hidden";

    var expandCollapseButton = document.createElement("button");
    var expanded = false;
    expandCollapseButton.innerText = "🔽";
    expandCollapseButton.onclick = () => {
        if(expanded) {
            expanded = false;
            expandCollapseButton.innerText = "🔽";
            buttonContainer.style.height = "30px";
        } else {
            expanded = true;
            expandCollapseButton.innerText = "🔼";
            buttonContainer.style.height = "300px";
        }
    };
    expandCollapseButton.style.margin = "5px";

    buttonContainer.appendChild(expandCollapseButton);

    var startButton = document.createElement("button");
    startButton.innerText = "Start Deletion";
    startButton.onclick = scheduleDeleteTimeline;
    startButton.style.margin = "5px";


    buttonContainer.appendChild(startButton);

    var stopButton = document.createElement("button");
    stopButton.innerText = "Stop Deletion";
    stopButton.onclick = () => { setStatus("stop deletion"); clearInterval(intervalId) };
    stopButton.style.margin = "5px";

    buttonContainer.appendChild(stopButton);


    skipInput = document.createElement("input");
    skipInput.style = "width: 20px; margin: 5px";
    
    skipInput.value = lineIndex;

    buttonContainer.appendChild(skipInput);

    var skipButton = document.createElement("button");
    skipButton.innerText = "Update Skip";
    skipButton.onclick = () => { setSkip(skipInput.value) };
    skipButton.style.margin = "5px";

    buttonContainer.appendChild(skipButton);

    var skipPlusOneButton = document.createElement("button");
    skipPlusOneButton.innerText = "Skip + 1";
    skipPlusOneButton.onclick = () => { setSkip((lineIndex + 1)) };
    skipPlusOneButton.style.margin = "5px";

    buttonContainer.appendChild(skipPlusOneButton);

    buttonContainer.appendChild(document.createElement("br"));


    var textarea = document.createElement("textarea");
    textarea.id = "cleanerstatus"
    textarea.style.margin = "5px";
    textarea.style.backgroundColor = "white";
    textarea.style.color = "black";
    textarea.style.width = "calc(100% - 15px)";
    textarea.style.height = "250px";
    buttonContainer.appendChild(textarea);
    document.body.appendChild(buttonContainer);

    setStatus("UI ready");
}

createUI()
