
console.log("Email Reply Extension - Content script loaded");

// Find the visible email messages in the Gmail conversation.
function getEmailContent() {
  const messages = Array.from(
    document.querySelectorAll(".a3s")
  );

  const visibleMessages = messages
    .filter((message) => {
      return (
        message.getClientRects().length > 0 &&
        message.innerText.trim().length > 0
      );
    })
    .map((message) => message.innerText.trim());

  if (visibleMessages.length === 0) {
    throw new Error(
      "Could not find the original email. Please open the email thread and try again."
    );
  }

  // Include visible messages from the conversation.
  return visibleMessages.join("\n\n--- Previous message ---\n\n");
}

// Display an error inside the compose window without modifying the draft.
function showError(composeWindow, message) {
  let errorBox = composeWindow.querySelector(
    ".ai-reply-error"
  );

  if (!errorBox) {
    errorBox = document.createElement("div");
    errorBox.className = "ai-reply-error";

    errorBox.style.cssText = `
      margin: 8px 0;
      padding: 10px 12px;
      border: 1px solid #d93025;
      border-radius: 8px;
      background: #fce8e6;
      color: #b3261e;
      font-size: 13px;
      line-height: 1.5;
    `;

    const editor = composeWindow.querySelector(
      '[contenteditable="true"][role="textbox"], [contenteditable="true"]'
    );

    if (editor && editor.parentElement) {
      editor.parentElement.insertBefore(errorBox, editor);
    } else {
      composeWindow.appendChild(errorBox);
    }
  }

  errorBox.textContent = message;
  errorBox.style.display = "block";
}

// Remove an old error when the user retries.
function clearError(composeWindow) {
  const errorBox = composeWindow.querySelector(
    ".ai-reply-error"
  );

  if (errorBox) {
    errorBox.remove();
  }
}

// Insert generated text while preserving any existing draft.
function insertGeneratedReply(editor, generatedReply, originalDraft) {
  const currentDraft = editor.innerText;

  // Do not overwrite text the user added while the request was running.
  if (currentDraft !== originalDraft) {
    throw new Error(
      "Your draft changed while the reply was generating. Your draft has been preserved; please try again."
    );
  }

  const separator = currentDraft.trim() ? "\n\n" : "";
  const finalText = currentDraft + separator + generatedReply;

  editor.focus();

  // Use the editor's native setter so the text is inserted as plain text.
  const selection = window.getSelection();
  const range = document.createRange();

  range.selectNodeContents(editor);
  range.collapse(false);

  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }

  // If the draft is empty, insert the reply directly.
  // If it contains text, append without deleting the existing draft.
  if (!currentDraft.trim()) {
    editor.replaceChildren(document.createTextNode(generatedReply));
  } else {
    editor.appendChild(document.createTextNode(separator + generatedReply));
  }

  editor.dispatchEvent(
    new InputEvent("input", {
      bubbles: true,
      inputType: "insertText",
      data: generatedReply,
    })
  );

  editor.dispatchEvent(
    new Event("change", { bubbles: true })
  );
}

// Add the AI Reply button to Gmail compose/reply windows.
function injectButtons() {
  const composeWindows = document.querySelectorAll(
    ".M9, .AD, [role='dialog']"
  );

  composeWindows.forEach((composeWindow) => {
    const editor = composeWindow.querySelector(
      '[contenteditable="true"][role="textbox"], [contenteditable="true"]'
    );

    if (!editor) return;

    if (composeWindow.querySelector(".ai-reply-button")) {
      return;
    }

    const sendButton = Array.from(
      composeWindow.querySelectorAll(
        'div[role="button"], button'
      )
    ).find((element) => {
      const label = (
        element.getAttribute("aria-label") ||
        element.getAttribute("data-tooltip") ||
        element.innerText ||
        ""
      ).trim();

      return /^send(\s|$)/i.test(label);
    });

    if (!sendButton || !sendButton.parentElement) {
      return;
    }

    const button = document.createElement("button");

    button.className = "ai-reply-button";
    button.type = "button";
    button.textContent = "✨ AI Reply";
    button.title = "Generate an AI email reply";

    button.style.cssText = `
      background: #1a73e8;
      color: white;
      border: none;
      border-radius: 18px;
      padding: 9px 15px;
      margin: 0 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
    `;

    // Handle the AI Reply button click.
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (button.disabled) return;

      const originalButtonText = "✨ AI Reply";
      const originalDraft = editor.innerText;

      button.disabled = true;
      button.textContent = "Generating...";
      button.style.opacity = "0.7";
      button.style.cursor = "wait";

      clearError(composeWindow);

      try {
        // Step 1: Get the original email thread.
        const emailContent = getEmailContent();

        // Step 2: Send the email to the Spring Boot backend.
        const response = await fetch(
          "http://localhost:8080/api/email/generate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              emailContent: emailContent,
              tone: "Professional",
            }),
          }
        );

        // Step 3: Handle unsuccessful API responses.
        if (!response.ok) {
          throw new Error(
            `API request failed (HTTP ${response.status})`
          );
        }

        // Step 4: Read the plain-text generated reply.
        const generatedReply = await response.text();

        if (!generatedReply.trim()) {
          throw new Error(
            "The API returned an empty reply. Please try again."
          );
        }

        console.log("Generated reply received.");

        // Step 5: Insert the reply without losing an existing draft.
        insertGeneratedReply(
          editor,
          generatedReply.trim(),
          originalDraft
        );

        clearError(composeWindow);
        console.log("Generated reply inserted into Gmail.");

      } catch (error) {
        console.error("AI Reply Error:", error);

        showError(
          composeWindow,
          error.message ||
            "Failed to generate the reply. Please try again."
        );
      } finally {
        // Step 6: Restore the button whether the request succeeds or fails.
        button.disabled = false;
        button.textContent = originalButtonText;
        button.style.opacity = "1";
        button.style.cursor = "pointer";
      }
    });

    sendButton.parentElement.insertBefore(
      button,
      sendButton
    );

    console.log("AI Reply button added successfully.");
  });
}

// Check Gmail now and whenever its interface changes.
injectButtons();

const observer = new MutationObserver(() => {
  injectButtons();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
