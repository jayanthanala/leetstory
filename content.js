const difficultyTagSelector = 'div[class*="text-difficulty-"]';
const descriptionContainerSelector = 'div.elfjS';

const companyLogos = {
  Google: 'https://images.icon-icons.com/729/PNG/512/google_icon-icons.com_62736.png',
  Meta: 'https://img.icons8.com/?size=100&id=PvvcWRWxRKSR&format=png&color=000000',
  Amazon: 'https://images.icon-icons.com/836/PNG/512/Amazon_icon-icons.com_66787.png',
  Apple: 'https://img.icons8.com/?size=100&id=30840&format=png&color=000000'
};

async function getRephrasedProblem(company) {
  const descriptionContainer = document.querySelector(descriptionContainerSelector);
  if(!descriptionContainer) return;
  descriptionContainer.innerHTML = `
    <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 250px; font-family: sans-serif; text-align: center;">
      <p style="font-size: 1.1em; font-weight: bold; margin: 0; color: var(--text-secondary);">Rephrasing problem for ${company}...</p>
      <p style="font-size: 2.5em; margin-top: 15px;">⏳</p>
    </div>
  `;

  try {
    const titleElement = document.querySelector('div.text-title-large');
    const fullProblemText = `Title: ${titleElement.innerText}\n\nDescription:\n${descriptionContainer.innerHTML}`;

    const response = await fetch('http://localhost:3000/rephrase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: fullProblemText, company: company }),
    });

    if(!response.ok){ throw new Error(`Server error! Status: ${response.status}`); }
    const data = await response.json();
    descriptionContainer.innerHTML = data.rephrasedText;

  } catch (error) {
    console.error("Error during rephrase:", error);
    descriptionContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 250px; font-family: sans-serif; text-align: center; color: var(--text-secondary);">
        <p style="font-size: 1.2em; font-weight: bold;">Oops! Something went wrong.</p>
        <p>Could not connect to the server. Make sure it's running and try again.</p>
      </div>
    `;
  }
}

function injectUI() {
    const difficultyTag = document.querySelector(difficultyTagSelector);
    const tagsContainer = difficultyTag ? difficultyTag.parentElement : null;

    if(tagsContainer && !document.getElementById('story-mode-controls')){
      const controlsDiv = document.createElement('div');
      controlsDiv.id = 'story-mode-controls';
      controlsDiv.style.display = 'flex';
      controlsDiv.style.alignItems = 'center';
      controlsDiv.style.gap = '12px';
      controlsDiv.style.marginTop = '10px';

      // const labelSpan = document.createElement('span');
      // labelSpan.style.fontSize = '13px';
      // labelSpan.style.fontWeight = 'bold';
      // labelSpan.style.color = 'rgb(175, 175, 175)';
      // labelSpan.textContent = 'Story Mode:';
      // controlsDiv.appendChild(labelSpan);

      for (const company in companyLogos) {
        const logoUrl = companyLogos[company];
        const imgButton = document.createElement('img');
        imgButton.src = logoUrl;
        imgButton.title = `Rephrase for ${company}`;
        imgButton.style.width = '22px';
        imgButton.style.height = '22px';
        imgButton.style.borderRadius = '50%';
        imgButton.style.cursor = 'pointer';
        imgButton.style.backgroundColor = 'white';
        imgButton.style.padding = '4px';
        imgButton.style.transition = 'opacity 0.2s';
        imgButton.style.opacity = '0.7';
        imgButton.style.objectFit = 'contain';

        imgButton.addEventListener('mouseover', () => { imgButton.style.opacity = '1'; });
        imgButton.addEventListener('mouseout', () => { imgButton.style.opacity = '0.7'; });
        imgButton.addEventListener('click', () => { getRephrasedProblem(company); });

        controlsDiv.appendChild(imgButton);
      }

      tagsContainer.insertAdjacentElement('afterend', controlsDiv);
    }
}

function injectCustomStyles() {
  const styleId = 'story-mode-custom-styles';
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    .elfjS p, .elfjS li {
      color: var(--text-primary);
      font-size: 14px;
      line-height: 1.6;
    }
    .elfjS strong {
      color: var(--text-primary);
      font-weight: 600;
    }
    .elfjS pre {
      margin-top: 1em;
      margin-bottom: 1em;
    }
    .elfjS code {
      color: var(--text-secondary);
      background-color: var(--fill-quaternary);
      font-family: Menlo, Monaco, 'Courier New', monospace;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-size: 0.9em;
    }
    .elfjS pre code {
      background-color: transparent;
      padding: 0;
      font-size: 1em;
    }
  `;
  document.head.appendChild(style);
}

const observer = new MutationObserver((mutationsList, obs) => {
  if (document.querySelector(difficultyTagSelector)) {
    injectUI();
    injectCustomStyles();
    obs.disconnect();
  }
});

observer.observe(document.body, { childList: true, subtree: true });