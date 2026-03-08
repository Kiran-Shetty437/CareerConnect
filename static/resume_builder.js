document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    const demos = {};

    // --- Dynamic Templates from Admin ---
    if (window.dynamicTemplatesData && Array.isArray(window.dynamicTemplatesData)) {
        window.dynamicTemplatesData.forEach(dt => {
            demos[dt.templateId] = {
                ...dt.demo,
                templateId: dt.templateId,
                baseLayout: dt.baseLayout
            };
        });
    }

    let activeTemplate = Object.keys(demos)[0] || 'marjorie';
    let resumeData = { personal: {}, experience: [], education: [], skills: [] };

    const getMergedData = () => {
        const demo = demos[activeTemplate] || { personal: {}, experience: [], education: [], skills: [] };
        const merged = {
            templateId: activeTemplate,
            baseLayout: resumeData.baseLayout || demo.baseLayout,
            design: demo.design,
            summaryTitle: demo.summaryTitle,
            experienceTitle: demo.experienceTitle,
            educationTitle: demo.educationTitle,
            skillsTitle: demo.skillsTitle,
            personal: {},
            experience: [],
            education: [],
            skills: []
        };
        const pKeys = ['fullName', 'email', 'phone', 'location', 'dob', 'professionalTitle', 'summary', 'linkedin', 'twitter', 'website', 'portfolio', 'profilePhoto'];
        pKeys.forEach(k => {
            merged.personal[k] = (resumeData.personal[k] && String(resumeData.personal[k]).trim() !== '') ? resumeData.personal[k] : demo.personal[k];
        });

        merged.experience = resumeData.experience.length > 0 ? resumeData.experience : demo.experience;
        merged.education = resumeData.education.length > 0 ? resumeData.education : demo.education;
        merged.skills = (resumeData.skills && resumeData.skills.length > 0) ? resumeData.skills : demo.skills;

        return merged;
    };

    // --- DOM Elements ---
    const screens = {
        template: document.getElementById('rb-template-selection'),
        input: document.getElementById('rb-content-input'),
        final: document.getElementById('rb-final-preview')
    };
    const indicators = {
        step1: document.getElementById('rb-step1-indicator'),
        step2: document.getElementById('rb-step2-indicator'),
        step3: document.getElementById('rb-step3-indicator')
    };
    const templateCards = document.querySelectorAll('.rb-template-card');
    const previewContainer = document.getElementById('rb-live-preview-container');
    const finalResumeContainer = document.getElementById('rb-final-resume-container');
    const formContainer = document.getElementById('rb-resume-form');

    // --- Dynamic Form Logic ---
    const updateFormFields = (templateId) => {
        const layoutType = demos[templateId].baseLayout || templateId;
        const demo = demos[templateId] || { personal: {} };

        let html = `
            <div class="rb-form-section" data-section="personal">
                <h2>Personal Details</h2>
        `;

        if (layoutType === 'marjorie' || layoutType === 'juliana' || layoutType === 'dynamic') {
            html += `
                <div class="rb-input-group">
                    <label>Profile Photo</label>
                    <input type="file" id="rb-photo-upload" accept="image/*">
                </div>
            `;
        }

        html += `
                <div class="rb-input-group">
                    <label>Full Name</label>
                    <input type="text" id="rb-fullName" value="${resumeData.personal.fullName || ''}" placeholder="${demo.personal.fullName || 'E.g. John Doe'}">
                </div>
                <div class="rb-input-row">
                    <div class="rb-input-group">
                        <label>Email</label>
                        <input type="email" id="rb-email" value="${resumeData.personal.email || ''}" placeholder="${demo.personal.email || 'john@example.com'}">
                    </div>
                    <div class="rb-input-group">
                        <label>Phone</label>
                        <input type="tel" id="rb-phone" value="${resumeData.personal.phone || ''}" placeholder="${demo.personal.phone || '123-456-7890'}">
                    </div>
                </div>
        `;

        if (templateId === 'marjorie') {
            html += `
                <div class="rb-input-group">
                    <label>Date of Birth</label>
                    <input type="text" id="rb-dob" value="${resumeData.personal.dob || ''}" placeholder="${demo.personal.dob || 'January 1, 1990'}">
                </div>
            `;
        }

        html += `
                <div class="rb-input-group">
                    <label>Location / Address</label>
                    <input type="text" id="rb-location" value="${resumeData.personal.location || ''}" placeholder="${demo.personal.location || 'New York, NY'}">
                </div>
        `;

        if (layoutType === 'john') {
            html += `
                <div class="rb-input-row">
                    <div class="rb-input-group">
                        <label>LinkedIn</label>
                        <input type="text" id="rb-linkedin" value="${resumeData.personal.linkedin || ''}" placeholder="${demo.personal.linkedin || 'linkedin.com/in/john'}">
                    </div>
                    <div class="rb-input-group">
                        <label>Twitter</label>
                        <input type="text" id="rb-twitter" value="${resumeData.personal.twitter || ''}" placeholder="${demo.personal.twitter || '@johndoe'}">
                    </div>
                </div>
            `;
        } else if (layoutType === 'juliana') {
            html += `
                <div class="rb-input-group">
                    <label>Website</label>
                    <input type="text" id="rb-website" value="${resumeData.personal.website || ''}" placeholder="${demo.personal.website || 'www.example.com'}">
                </div>
            `;
        } else if (layoutType === 'amanda' || layoutType === 'dynamic') {
            html += `
                 <div class="rb-input-row">
                    <div class="rb-input-group">
                        <label>LinkedIn</label>
                        <input type="text" id="rb-linkedin" value="${resumeData.personal.linkedin || ''}" placeholder="${demo.personal.linkedin || 'linkedin.com/in/john'}">
                    </div>
                    <div class="rb-input-group">
                        <label>Portfolio</label>
                        <input type="text" id="rb-portfolio" value="${resumeData.personal.portfolio || ''}" placeholder="${demo.personal.portfolio || 'github.com/john'}">
                    </div>
                </div>
            `;
        }

        html += `
                <div class="rb-input-group">
                    <label>Professional Title</label>
                    <input type="text" id="rb-professionalTitle" value="${resumeData.personal.professionalTitle || ''}" placeholder="${demo.personal.professionalTitle || 'Software Engineer'}">
                </div>
                <div class="rb-input-group">
                    <label>Objective Summary</label>
                    <textarea id="rb-summary" placeholder="${demo.personal.summary || 'Summary...'}">${resumeData.personal.summary || ''}</textarea>
                </div>
            </div>
        `;

        html += `
            <div class="rb-form-section">
                <h2>Experience</h2>
                <div id="rb-experience-list"></div>
                <button type="button" class="btn btn-outline" id="rb-add-experience">+ Add Experience</button>
            </div>
            <div class="rb-form-section">
                <h2>Education</h2>
                <div id="rb-education-list"></div>
                <button type="button" class="btn btn-outline" id="rb-add-education">+ Add Education</button>
            </div>
        `;

        html += `
            <div class="rb-form-section">
                <h2>Skills</h2>
                <input type="text" id="rb-skills-input" value="${(resumeData.skills || []).join(', ')}">
            </div>
            <div class="rb-form-section" style="margin-top: 10px;">
                <p style="font-size: 0.8rem; color: #666; font-style: italic;">
                    Note: The base layout determines the overall visual structure, but all entered content (Experience, Education, Skills) will be dynamically rendered to ensure nothing is lost from your original design.
                </p>
            </div>
        `;

        formContainer.innerHTML = html;

        formContainer.querySelectorAll('input, textarea').forEach(i => i.addEventListener('input', syncForm));

        const photoInput = document.getElementById('rb-photo-upload');
        if (photoInput) {
            photoInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        resumeData.personal.profilePhoto = event.target.result;
                        updatePreview();
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        document.getElementById('rb-add-experience').addEventListener('click', () => {
            addListItem('rb-experience-list', { role: '', company: '', duration: '', desc: '' }, 'exp');
        });
        document.getElementById('rb-add-education').addEventListener('click', () => {
            addListItem('rb-education-list', { degree: '', school: '', year: '' }, 'edu');
        });

        resumeData.experience.forEach(e => addListItem('rb-experience-list', e, 'exp'));
        resumeData.education.forEach(ed => addListItem('rb-education-list', ed, 'edu'));
    };

    const addListItem = (containerId, data, type) => {
        const div = document.createElement('div');
        div.className = 'rb-experience-item';
        div.innerHTML = `<button class="remove-item">×</button>`;

        if (type === 'exp') {
            div.innerHTML += `
                <input type="text" value="${data.role}" placeholder="Role" class="rb-item-role">
                <input type="text" value="${data.company}" placeholder="Company" class="rb-item-company">
                <input type="text" value="${data.duration}" placeholder="Duration" class="rb-item-duration">
                <textarea class="rb-item-desc" placeholder="Desc">${data.desc}</textarea>
            `;
        } else {
            div.innerHTML += `
                <input type="text" value="${data.degree}" placeholder="Degree" class="rb-item-degree">
                <input type="text" value="${data.school}" placeholder="School" class="rb-item-school">
                <input type="text" value="${data.year}" placeholder="Year" class="rb-item-year">
            `;
        }

        div.querySelector('.remove-item').addEventListener('click', () => { div.remove(); syncForm(); });
        div.querySelectorAll('input, textarea').forEach(i => i.addEventListener('input', syncForm));
        document.getElementById(containerId).appendChild(div);
    };

    const syncForm = () => {
        resumeData.personal.fullName = document.getElementById('rb-fullName')?.value || '';
        resumeData.personal.email = document.getElementById('rb-email')?.value || '';
        resumeData.personal.phone = document.getElementById('rb-phone')?.value || '';
        resumeData.personal.location = document.getElementById('rb-location')?.value || '';
        resumeData.personal.professionalTitle = document.getElementById('rb-professionalTitle')?.value || '';
        resumeData.personal.summary = document.getElementById('rb-summary')?.value || '';

        if (document.getElementById('rb-dob')) resumeData.personal.dob = document.getElementById('rb-dob').value;
        if (document.getElementById('rb-linkedin')) resumeData.personal.linkedin = document.getElementById('rb-linkedin').value;
        if (document.getElementById('rb-twitter')) resumeData.personal.twitter = document.getElementById('rb-twitter').value;
        if (document.getElementById('rb-website')) resumeData.personal.website = document.getElementById('rb-website').value;
        if (document.getElementById('rb-portfolio')) resumeData.personal.portfolio = document.getElementById('rb-portfolio').value;

        resumeData.experience = Array.from(document.querySelectorAll('#rb-experience-list .rb-experience-item')).map(i => ({
            role: i.querySelector('.rb-item-role').value,
            company: i.querySelector('.rb-item-company').value,
            duration: i.querySelector('.rb-item-duration').value,
            desc: i.querySelector('.rb-item-desc').value
        })).filter(e => e.role || e.company || e.desc);

        resumeData.education = Array.from(document.querySelectorAll('#rb-education-list .rb-experience-item')).map(i => ({
            degree: i.querySelector('.rb-item-degree').value,
            school: i.querySelector('.rb-item-school').value,
            year: i.querySelector('.rb-item-year').value
        })).filter(e => e.degree || e.school);

        const getCommas = (id) => (document.getElementById(id)?.value || '').split(',').map(s => s.trim()).filter(s => s);
        if (document.getElementById('rb-skills-input')) resumeData.skills = getCommas('rb-skills-input');

        updatePreview();
    };

    const renderTemplate = (data) => {
        const { personal, experience, education, templateId } = data;
        const layoutType = data.baseLayout || templateId;
        const wrap = (title, content) => content ? `<div class="res-section"> <h3>${title}</h3>${content}</div> ` : '';

        const styles = `
                <style>
                .res-body { font-family: 'Inter', sans-serif; padding: 30px; color: #333; background: #fff; line-height: 1.4; font-size: 9pt; height: 100%; border: 1px solid #ddd; }
                .res-header { border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 15px; }
                .res-name { font-size: 2rem; font-weight: 800; margin: 0; color: #000; }
                .res-title { font-size: 1rem; color: #555; text-transform: uppercase; letter-spacing: 1px; }
                .res-contact { display: flex; flex-wrap: wrap; gap: 10px; font-size: 0.8rem; color: #666; margin-top: 5px; }
                .res-section h3 { border-bottom: 1px solid #ccc; padding-bottom: 3px; margin: 15px 0 8px; text-transform: uppercase; font-size: 0.9rem; color: #222; }
                .res-item { margin-bottom: 10px; }
                .res-item-head { display: flex; justify-content: space-between; font-weight: 700; }
                .res-item-meta { font-size: 0.8rem; color: #777; margin-bottom: 2px; }
                .theme-juliana { display: grid; grid-template-columns: 1fr 2fr; gap: 20px; }
            </style>
        `;

        const expHtml = experience.map(e => `
        <div class="res-item">
                <div class="res-item-head"><span>${e.role}</span> <span>${e.duration}</span></div>
                <div class="res-item-meta">${e.company}</div>
                <p>${e.desc}</p>
            </div>
        `).join('');

        const eduHtml = education.map(ed => `
        <div class="res-item">
                <div class="res-item-head"><span>${ed.degree}</span> <span>${ed.year}</span></div>
                <div class="res-item-meta">${ed.school}</div>
            </div>
        `).join('');

        const expTitle = data.experienceTitle || 'Work Experience';
        const eduTitle = data.educationTitle || 'Education';
        const skiTitle = data.skillsTitle || 'Skills';
        const sumTitle = data.summaryTitle || 'Professional Summary';

        const skillsHtml = (data.skills && data.skills.length > 0) ? `<ul class="res-skills-list" style = "margin: 0; padding-left: 20px;" > ${data.skills.map(s => `<li>${s}</li>`).join('')}</ul> ` : '';

        const commonContact = `
        <div class="res-contact">
            <span>${personal.email || ''}</span> 
                ${personal.phone ? `<span>${personal.phone}</span>` : ''} 
                ${personal.location ? `<span>${personal.location}</span>` : ''}
                ${personal.linkedin ? `<span>LinkedIn: ${personal.linkedin}</span>` : ''}
            </div>
        `;

        if (layoutType === 'marjorie') {
            return `
        <div class="res-body" >
            ${styles}
    <div class="res-header" style="display: flex; gap: 20px; align-items: center;">
        ${personal.profilePhoto ? `<img src="${personal.profilePhoto}" style="width: 100px; height: 125px; object-fit: cover; border: 1px solid #ddd;">` : `<div style="width: 100px; height: 125px; background: #eee; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: #999;">Photo</div>`}
        <div style="flex: 1;">
            <h1 class="res-name">${personal.fullName || ''}</h1>
            ${commonContact}
        </div>
    </div>
                    ${wrap(sumTitle, personal.summary ? `<p>${personal.summary}</p>` : '')}
                    ${wrap(expTitle, expHtml)}
                    ${wrap(eduTitle, eduHtml)}
                    ${wrap(skiTitle, skillsHtml)}
                </div>
        `;
        }

        if (layoutType === 'john') {
            return `
        <div class="res-body" >
            ${styles}
    <div class="res-header">
        <h1 class="res-name" style="color: #6366f1;">${personal.fullName || ''}</h1>
        <p class="res-title">${personal.professionalTitle || ''}</p>
        ${commonContact}
    </div>
                    ${wrap(sumTitle, personal.summary ? `<p>${personal.summary}</p>` : '')}
                    ${wrap(expTitle, expHtml)}
                    ${wrap(eduTitle, eduHtml)}
                    ${wrap(skiTitle, skillsHtml)}
                </div>
        `;
        }

        if (layoutType === 'juliana') {
            return `
        <div class="res-body theme-juliana" >
            ${styles}
                    <div style="background: #f8f9fa; padding: 15px;">
                        ${personal.profilePhoto ? `<img src="${personal.profilePhoto}" style="width: 100%; aspect-ratio: 1; border-radius: 50%; object-fit: cover; margin-bottom: 15px;">` : `<div style="width: 100%; aspect-ratio: 1; border-radius: 50%; background: #ddd; margin-bottom: 15px;"></div>`}
                        <p>${personal.email || ''}<br>${personal.phone || ''}</p>
                        ${wrap(eduTitle, eduHtml)}
                        ${wrap(skiTitle, skillsHtml)}
                    </div>
                    <div>
                        <h1 class="res-name">${personal.fullName || ''}</h1>
                        <p class="res-title" style="margin-bottom: 15px; color: #888;">${personal.professionalTitle || ''}</p>
                        ${wrap(sumTitle, personal.summary ? `<p>${personal.summary}</p>` : '')}
                        ${wrap(expTitle, expHtml)}
                    </div>
                </div>
        `;
        }

        if (layoutType === 'amanda') {
            return `
        <div class="res-body" style = "text-align: center;" >
            ${styles}
                    <h1 class="res-name">${personal.fullName || ''}</h1>
                    <div style="margin: 5px 0;">${personal.email || ''} | ${personal.phone || ''}</div>
                    <div style="border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 10px 0; margin: 15px 0;">
                        <p>${personal.summary || ''}</p>
                    </div>
                    <div style="text-align: left;">
                        ${wrap(expTitle, expHtml)}
                        ${wrap(eduTitle, eduHtml)}
                        ${wrap(skiTitle, skillsHtml)}
                    </div>
                </div>
        `;
        }

        // Auto/Dynamic Layout (Generates visual structure from AI design object)
        const d = data.design || {};
        const align = d.headerAlignment || 'center';
        const nColor = d.nameColor || '#000';
        const hColor = d.sectionHeadingColor || '#2e7d32'; // Default some green or dark

        const dynamicWrap = (title, content) => {
            if (!content) return '';
            return `
        <div class="res-section" style = "margin-top: 20px;" >
                    <h3 style="color: ${hColor}; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase;">${title}</h3>
                    <div style="padding-left: ${align === 'center' ? '0' : '10px'}">
                        ${content}
                    </div>
                </div>
        `;
        };

        const topPhotoHtml = (d.hasPhoto && personal.profilePhoto) ? `<img src = "${personal.profilePhoto}" style = "width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin: ${align === 'center' ? '0 auto 15px' : '0 20px 0 0'}; display: block;" > ` : '';

        return `
        <div class="res-body" style = "font-family: 'Inter', sans-serif; padding: 40px; color: #333;" >
            ${styles}
    <div class="res-header" style="text-align: ${align}; ${align === 'left' && d.hasPhoto ? 'display: flex; align-items: center;' : ''}">
        ${align === 'left' ? topPhotoHtml : ''}
        <div style="${align === 'left' ? 'flex: 1;' : ''}">
            ${align === 'center' ? topPhotoHtml : ''}
            <h1 class="res-name" style="color: ${nColor}; font-size: 2.5rem; letter-spacing: 1px; margin-bottom: 5px;">${personal.fullName || 'Auto Generated Layout'}</h1>
            <p class="res-title" style="font-size: 1.1rem; color: #666; margin-bottom: 10px;">${personal.professionalTitle || ''}</p>
            <div style="font-size: 0.9rem; color: #555; display: flex; flex-wrap: wrap; gap: 15px; justify-content: ${align === 'center' ? 'center' : 'flex-start'};">
                ${personal.email ? `<span>${personal.email}</span>` : ''}
                ${personal.phone ? `<span>${personal.phone}</span>` : ''}
                ${personal.location ? `<span>${personal.location}</span>` : ''}
                ${personal.linkedin ? `<span>${personal.linkedin}</span>` : ''}
                ${personal.website ? `<span>${personal.website}</span>` : ''}
            </div>
        </div>
    </div>
                ${dynamicWrap(sumTitle, personal.summary ? `<p style="line-height: 1.6;">${personal.summary}</p>` : '')}
                ${dynamicWrap(expTitle, expHtml)}
                ${dynamicWrap(eduTitle, eduHtml)}
                ${dynamicWrap(skiTitle, skillsHtml)}
            </div>
        `;
    };

    const updatePreview = () => {
        const mergedData = getMergedData();
        const html = renderTemplate(mergedData);
        previewContainer.innerHTML = html;
        finalResumeContainer.innerHTML = html;
    };

    templateCards.forEach(card => {
        card.addEventListener('click', () => {
            activeTemplate = card.dataset.template;
            resumeData = { baseLayout: demos[activeTemplate]?.baseLayout, personal: {}, experience: [], education: [], skills: [] }; // Reset user data
            updateFormFields(activeTemplate);
            showScreen('input');
            updatePreview();
        });
    });

    const showScreen = (name) => {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        Object.values(indicators).forEach(i => i.classList.remove('active'));
        screens[name].classList.add('active');
        if (name === 'template') indicators.step1.classList.add('active');
        if (name === 'input') indicators.step2.classList.add('active');
        if (name === 'final') indicators.step3.classList.add('active');
        document.getElementById('rb-main-content').scrollTop = 0;
    };

    const initGrid = () => {
        Object.keys(demos).forEach(id => {
            const el = document.getElementById(`rb-preview-${id}`);
            if (el) el.innerHTML = renderTemplate(demos[id]);
        });
    };

    document.getElementById('rb-go-to-preview').addEventListener('click', () => showScreen('final'));
    document.getElementById('rb-back-to-templates').addEventListener('click', () => showScreen('template'));
    document.getElementById('rb-back-to-editor').addEventListener('click', () => showScreen('input'));

    document.getElementById('rb-download-pdf').addEventListener('click', () => {
        const opt = {
            margin: 0,
            filename: `${resumeData.personal.fullName}_Resume.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(finalResumeContainer).save();
    });

    initGrid();

    // Toggle Logic for Widget
    const rbToggle = document.getElementById('rbToggle');
    const rbClose = document.getElementById('rbClose');
    const rbWindow = document.getElementById('rbWindow');

    if (rbToggle) {
        rbToggle.addEventListener('click', () => {
            rbWindow.classList.add('active');
            rbToggle.style.display = 'none';
        });
    }

    if (rbClose) {
        rbClose.addEventListener('click', () => {
            rbWindow.classList.remove('active');
            rbToggle.style.display = 'flex';
        });
    }
});

