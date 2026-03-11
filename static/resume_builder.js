document.addEventListener('DOMContentLoaded', () => {
    // --- State: 5 New Demos from User Images ---
    const demos = {
        'marjorie': {
            templateId: 'marjorie',
            personal: {
                fullName: 'Marjorie D. McGahey',
                email: 'marjorie@jourrapide.com',
                phone: '718-564-6972',
                location: '526 Longview Avenue, Brooklyn, NY 11226',
                dob: 'April 4, 1987',
                professionalTitle: 'Sales Executive',
                summary: 'Take advantages of sales skills & experience and understanding of tyres market to become a professional Sales Staff and bring a lot value to Customers.',
                profilePhoto: ''
            },
            experience: [
                { company: 'UHE TRADING COMPANY', role: 'Sales Executive', duration: 'May 2011 - Now', desc: 'Manage a retail shop in NeyOm province. Attend tyres exhibitions, conferences and meetings with suppliers.' },
                { company: 'CULTURIMEX BRANCH', role: 'Marketing Executive', duration: 'Apr 2010 - Apr 2011', desc: 'Customer Care and look for new customers. Do marketing promotions for the image of the company.' }
            ],
            education: [
                { school: 'FOREIGN TRADE UNIVERSITY', degree: 'Major: Economics and International Business', year: 'Sep 2005 - June 2015', gpa: '7.34/10' }
            ],
            activities: ['Volunteering in New York: Belief Volunteers Group, Cycling for Environment (C4E).'],
            references: ['Ms. C. Smith, Vice Director of Culturimex Branch. Address: 763 Elk Rd Little, Tucson, AZ 85705']
        },
        'john': {
            templateId: 'john',
            personal: {
                fullName: 'John Smith',
                email: 'j.smith@uptowork.com',
                phone: '774-987-4009',
                linkedin: 'linkedin.com/johnutw',
                twitter: '@johnsmithutw',
                professionalTitle: 'IT Project Manager',
                summary: 'IT Professional with over 10 years of experience specializing in IT department management for international logistics companies.'
            },
            experience: [
                { company: 'Seton Hospital, ME', role: 'Senior Project Manager', duration: '2006-12 - present', desc: 'Oversaw all major hospital IT projects for 10+ years, focus on cost reduction.' },
                { company: 'Seton Hospital, ME', role: 'Junior Project Manager', duration: '2004-09 - 2006-12', desc: 'Streamlined IT logistics and administration operation cutting costs by 25%.' }
            ],
            education: [
                { school: 'University of Maryland', degree: 'Master of Computer Science', year: '1996-09 - 2001-05', honors: 'Graduated Summa Cum Laude' }
            ],
            skills: ['Business Process Improvement', 'Vendor Management', 'Project Scheduling', 'Sales Analysis'],
            software: [
                { name: 'Microsoft Project', level: 5, label: 'Excellent' },
                { name: 'Microsoft Windows Server', level: 4, label: 'Very Good' }
            ],
            certifications: ['PMP - Project Management Institute (2010-05)', 'CAPM - Project Management Institute (2007-11)']
        },
        'juliana': {
            templateId: 'juliana',
            personal: {
                fullName: 'Juliana Silva',
                professionalTitle: 'Art Director',
                phone: '+123-456-7890',
                email: 'hello@reallygreatsite.com',
                website: 'www.reallygreatsite.com',
                location: '123 Anywhere St., Any City, ST 12345',
                summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pharetra in lorem at laoreet. Donec hendrerit libero eget est tempor.',
                profilePhoto: ''
            },
            education: [
                { school: 'Wardiere University', degree: 'Bachelor of Design', year: '2006 - 2008' }
            ],
            experience: [
                { company: 'Company Name', role: 'Digital Marketing Manager', duration: 'Jan 2022- Present', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' }
            ],
            expertise: ['Web Design', 'Branding', 'Graphic Design', 'SEO', 'Marketing'],
            languages: ['English', 'French'],
            references: ['Estelle Darcy - Wardiere Inc. / CEO', 'Harper Russo - Wardiere Inc. / CEO']
        },
        'amanda': {
            templateId: 'amanda',
            personal: {
                fullName: 'Amanda Baker',
                phone: '(123) 456-7890',
                email: 'email@example.com',
                linkedin: 'LinkedIn',
                portfolio: 'Portfolio',
                location: 'City, State Abbreviation zip code',
                professionalTitle: 'Biology Professor',
                summary: 'An experienced undergraduate biology professor with a Ph.D. in Molecular Biology with an emphasis on molecular biology and genetics.'
            },
            experience: [
                { company: 'University of Utah, Salt Lake City, UT', role: 'Professor', duration: 'August 2019 – present', desc: 'Taught an average of four classes per semester, including labs.' }
            ],
            education: [
                { school: 'Boston University, Boston, MA', degree: 'Doctorate in Molecular Biology', year: 'August 2010 – May 2015' }
            ],
            skills: ['Blackboard', 'Classroom management', 'Experimental design', 'Laboratory management'],
            awards: ['Dr. Hurst Research Award for advancements in molecular biology, 2022', 'Innovative Teaching Award, Ohio State University, 2017']
        },
        'standard': {
            templateId: 'standard',
            personal: {
                fullName: 'Alexander Pierce',
                email: 'alex.pierce@example.com',
                phone: '+1 (555) 012-3456',
                location: 'San Francisco, CA',
                professionalTitle: 'Senior Full Stack Developer',
                summary: 'Innovative software engineer with 8+ years of experience in building scalable web applications.'
            },
            experience: [{ company: 'TechNova', role: 'Lead Dev', duration: '2020-now', desc: 'Led AWS migration.' }],
            education: [{ school: 'Stanford', degree: 'MS CS', year: '2017' }],
            techSkills: ['React', 'Node.js', 'AWS'],
            softSkills: ['Leadership', 'Agile']
        }
    };

    let activeTemplate = 'marjorie';
    let resumeData = JSON.parse(JSON.stringify(demos[activeTemplate]));

    // --- DOM Elements ---
    const screens = {
        template: document.getElementById('template-selection'),
        input: document.getElementById('content-input'),
        final: document.getElementById('final-preview')
    };
    const templateCards = document.querySelectorAll('.template-card');
    const previewContainer = document.getElementById('live-preview-container');
    const finalResumeContainer = document.getElementById('final-resume-container');
    const formContainer = document.getElementById('resume-form');

    // --- Dynamic Form Logic ---
    const updateFormFields = (templateId) => {
        // We will generate the form HTML based on the template requirements
        let html = `
            <div class="form-section active" data-section="personal">
                <h2>Personal Details</h2>
        `;

        // Photo option for specific templates
        if (templateId === 'marjorie' || templateId === 'juliana') {
            html += `
                <div class="input-group">
                    <label>Profile Photo</label>
                    <input type="file" id="photo-upload" accept="image/*">
                </div>
            `;
        }

        html += `
                <div class="input-group">
                    <label>Full Name</label>
                    <input type="text" id="fullName" value="${resumeData.personal.fullName || ''}">
                </div>
                <div class="input-row">
                    <div class="input-group">
                        <label>Email</label>
                        <input type="email" id="email" value="${resumeData.personal.email || ''}">
                    </div>
                    <div class="input-group">
                        <label>Phone</label>
                        <input type="tel" id="phone" value="${resumeData.personal.phone || ''}">
                    </div>
                </div>
        `;

        // Marjorie specific: DOB, Address
        if (templateId === 'marjorie') {
            html += `
                <div class="input-group">
                    <label>Date of Birth</label>
                    <input type="text" id="dob" value="${resumeData.personal.dob || ''}">
                </div>
            `;
        }

        html += `
                <div class="input-group">
                    <label>Location / Address</label>
                    <input type="text" id="location" value="${resumeData.personal.location || ''}">
                </div>
        `;

        // John/Amanda/Juliana extras
        if (templateId === 'john') {
            html += `
                <div class="input-row">
                    <div class="input-group">
                        <label>LinkedIn</label>
                        <input type="text" id="linkedin" value="${resumeData.personal.linkedin || ''}">
                    </div>
                    <div class="input-group">
                        <label>Twitter</label>
                        <input type="text" id="twitter" value="${resumeData.personal.twitter || ''}">
                    </div>
                </div>
            `;
        } else if (templateId === 'juliana') {
            html += `
                <div class="input-group">
                    <label>Website</label>
                    <input type="text" id="website" value="${resumeData.personal.website || ''}">
                </div>
            `;
        } else if (templateId === 'amanda') {
            html += `
                 <div class="input-row">
                    <div class="input-group">
                        <label>LinkedIn</label>
                        <input type="text" id="linkedin" value="${resumeData.personal.linkedin || ''}">
                    </div>
                    <div class="input-group">
                        <label>Portfolio</label>
                        <input type="text" id="portfolio" value="${resumeData.personal.portfolio || ''}">
                    </div>
                </div>
            `;
        }

        html += `
                <div class="input-group">
                    <label>Professional Title</label>
                    <input type="text" id="professionalTitle" value="${resumeData.personal.professionalTitle || ''}">
                </div>
                <div class="input-group">
                    <label>Objective / Profile Summary</label>
                    <textarea id="summary">${resumeData.personal.summary || ''}</textarea>
                </div>
            </div>
        `;

        // Experience Section
        html += `
            <div class="form-section">
                <h2>Experience / Work History</h2>
                <div id="experience-list"></div>
                <button type="button" class="btn btn-outline" id="add-experience">+ Add Experience</button>
            </div>
        `;

        // Education Section
        html += `
            <div class="form-section">
                <h2>Education</h2>
                <div id="education-list"></div>
                <button type="button" class="btn btn-outline" id="add-education">+ Add Education</button>
            </div>
        `;

        // Template specific dynamic sections
        if (templateId === 'john' || templateId === 'amanda' || templateId === 'standard') {
            html += `
                <div class="form-section">
                    <h2>Skills</h2>
                    <div class="input-group">
                        <label>Skills (comma separated)</label>
                        <input type="text" id="skills-input" value="${(resumeData.skills || resumeData.techSkills || []).join(', ')}">
                    </div>
                </div>
            `;
        }

        if (templateId === 'john') {
            html += `
                <div class="form-section">
                    <h2>Software Proficiency</h2>
                    <div class="input-group">
                        <label>Software & Level (e.g. MS Project: Excellent, Excel: Good)</label>
                        <input type="text" id="software-input" value="${(resumeData.software || []).map(s => s.name + ': ' + (s.label || s.level)).join(', ')}">
                    </div>
                </div>
                <div class="form-section">
                    <h2>Certifications</h2>
                    <input type="text" id="certifications-input" value="${(resumeData.certifications || []).join(', ')}">
                </div>
            `;
        }

        if (templateId === 'marjorie') {
            html += `
                <div class="form-section">
                    <h2>Activities</h2>
                    <textarea id="activities-input">${(resumeData.activities || []).join('\n')}</textarea>
                </div>
                <div class="form-section">
                    <h2>References</h2>
                    <textarea id="references-input">${(resumeData.references || []).join('\n')}</textarea>
                </div>
            `;
        }

        if (templateId === 'juliana') {
            html += `
                <div class="form-section">
                    <h2>Expertise / Skills</h2>
                    <input type="text" id="expertise-input" value="${(resumeData.expertise || []).join(', ')}">
                </div>
                <div class="form-section">
                    <h2>Languages</h2>
                    <input type="text" id="languages-input" value="${(resumeData.languages || []).join(', ')}">
                </div>
                <div class="form-section">
                    <h2>References</h2>
                    <textarea id="references-input">${(resumeData.references || []).join('\n')}</textarea>
                </div>
            `;
        }

        if (templateId === 'amanda') {
            html += `
                <div class="form-section">
                    <h2>Professional Awards</h2>
                    <textarea id="awards-input">${(resumeData.awards || []).join('\n')}</textarea>
                </div>
            `;
        }

        formContainer.innerHTML = html;

        // Re-attach listeners Table
        formContainer.querySelectorAll('input, textarea').forEach(i => i.addEventListener('input', syncForm));

        // Handle Photo Upload separately
        const photoInput = document.getElementById('photo-upload');
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

        document.getElementById('add-experience').addEventListener('click', () => {
            addListItem('experience-list', { role: '', company: '', duration: '', desc: '' }, 'exp');
        });
        document.getElementById('add-education').addEventListener('click', () => {
            addListItem('education-list', { degree: '', school: '', year: '' }, 'edu');
        });

        // Initialize lists
        resumeData.experience.forEach(e => addListItem('experience-list', e, 'exp'));
        resumeData.education.forEach(ed => addListItem('education-list', ed, 'edu'));
    };

    const addListItem = (containerId, data, type) => {
        const div = document.createElement('div');
        div.className = 'experience-item';
        div.innerHTML = `<button class="remove-item">×</button>`;

        if (type === 'exp') {
            div.innerHTML += `
                <input type="text" value="${data.role}" placeholder="Role" class="item-role">
                <input type="text" value="${data.company}" placeholder="Company" class="item-company">
                <input type="text" value="${data.duration}" placeholder="Duration" class="item-duration">
                <textarea class="item-desc" placeholder="Desc">${data.desc}</textarea>
            `;
        } else {
            div.innerHTML += `
                <input type="text" value="${data.degree}" placeholder="Degree" class="item-degree">
                <input type="text" value="${data.school}" placeholder="School" class="item-school">
                <input type="text" value="${data.year}" placeholder="Year" class="item-year">
            `;
        }

        div.querySelector('.remove-item').addEventListener('click', () => { div.remove(); syncForm(); });
        div.querySelectorAll('input, textarea').forEach(i => i.addEventListener('input', syncForm));
        document.getElementById(containerId).appendChild(div);
    };

    const syncForm = () => {
        resumeData.personal.fullName = document.getElementById('fullName').value;
        resumeData.personal.email = document.getElementById('email').value;
        resumeData.personal.phone = document.getElementById('phone').value;
        resumeData.personal.location = document.getElementById('location').value;
        resumeData.personal.professionalTitle = document.getElementById('professionalTitle').value;
        resumeData.personal.summary = document.getElementById('summary').value;

        if (document.getElementById('dob')) resumeData.personal.dob = document.getElementById('dob').value;
        if (document.getElementById('linkedin')) resumeData.personal.linkedin = document.getElementById('linkedin').value;
        if (document.getElementById('twitter')) resumeData.personal.twitter = document.getElementById('twitter').value;
        if (document.getElementById('website')) resumeData.personal.website = document.getElementById('website').value;
        if (document.getElementById('portfolio')) resumeData.personal.portfolio = document.getElementById('portfolio').value;

        // Lists
        resumeData.experience = Array.from(document.querySelectorAll('#experience-list .experience-item')).map(i => ({
            role: i.querySelector('.item-role').value,
            company: i.querySelector('.item-company').value,
            duration: i.querySelector('.item-duration').value,
            desc: i.querySelector('.item-desc').value
        }));
        resumeData.education = Array.from(document.querySelectorAll('#education-list .experience-item')).map(i => ({
            degree: i.querySelector('.item-degree').value,
            school: i.querySelector('.item-school').value,
            year: i.querySelector('.item-year').value
        }));

        // Comma fields
        const getCommas = (id) => (document.getElementById(id)?.value || '').split(',').map(s => s.trim()).filter(s => s);
        if (document.getElementById('skills-input')) resumeData.skills = getCommas('skills-input');
        if (document.getElementById('expertise-input')) resumeData.expertise = getCommas('expertise-input');
        if (document.getElementById('languages-input')) resumeData.languages = getCommas('languages-input');
        if (document.getElementById('certifications-input')) resumeData.certifications = getCommas('certifications-input');

        // Textarea fields
        const getLines = (id) => (document.getElementById(id)?.value || '').split('\n').filter(s => s.trim());
        if (document.getElementById('activities-input')) resumeData.activities = getLines('activities-input');
        if (document.getElementById('references-input')) resumeData.references = getLines('references-input');
        if (document.getElementById('awards-input')) resumeData.awards = getLines('awards-input');

        updatePreview();
    };

    // --- Rendering Logic ---
    const renderTemplate = (data) => {
        const { personal, experience, education, templateId } = data;

        const wrap = (title, content) => content ? `<div class="res-section"><h3>${title}</h3>${content}</div>` : '';

        const styles = `
            <style>
                .res-body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; background: #fff; line-height: 1.5; font-size: 10pt; }
                .res-header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
                .res-name { font-size: 2.5rem; font-weight: 800; margin: 0; color: #000; }
                .res-title { font-size: 1.2rem; color: #555; text-transform: uppercase; letter-spacing: 2px; }
                .res-contact { display: flex; flex-wrap: wrap; gap: 15px; font-size: 0.9rem; color: #666; margin-top: 10px; }
                .res-section h3 { border-bottom: 1px solid #ccc; padding-bottom: 5px; margin: 20px 0 10px; text-transform: uppercase; font-size: 1rem; color: #222; }
                .res-item { margin-bottom: 15px; }
                .res-item-head { display: flex; justify-content: space-between; font-weight: 700; }
                .res-item-meta { font-size: 0.85rem; color: #777; margin-bottom: 3px; }
                ul { padding-left: 20px; }
                .theme-john { color: #2d3436; }
                .theme-juliana { display: grid; grid-template-columns: 1fr 2fr; gap: 30px; }
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

        const commonContact = `
            <div class="res-contact">
                <span>${personal.email}</span> <span>${personal.phone}</span> <span>${personal.location}</span>
                ${personal.dob ? `<span>DOB: ${personal.dob}</span>` : ''}
                ${personal.website ? `<span>${personal.website}</span>` : ''}
                ${personal.linkedin ? `<span>LinkedIn: ${personal.linkedin}</span>` : ''}
                ${personal.twitter ? `<span>Twitter: ${personal.twitter}</span>` : ''}
            </div>
        `;

        if (templateId === 'marjorie') {
            return `
                <div class="res-body">
                    ${styles}
                    <div class="res-header" style="display: flex; gap: 30px; align-items: center;">
                        ${personal.profilePhoto ? `<img src="${personal.profilePhoto}" style="width: 120px; height: 150px; object-fit: cover; border: 1px solid #ddd;">` : `<div style="width: 120px; height: 150px; background: #eee; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; color: #999;">Photo</div>`}
                        <div style="flex: 1;">
                            <h1 class="res-name">${personal.fullName}</h1>
                            ${commonContact}
                        </div>
                    </div>
                    ${wrap('Objective', `<p>${personal.summary}</p>`)}
                    ${wrap('Education', eduHtml)}
                    ${wrap('Work Experience', expHtml)}
                    ${wrap('Activities', `<ul>${(data.activities || []).map(a => `<li>${a}</li>`).join('')}</ul>`)}
                    ${wrap('References', `<p style="white-space: pre-line;">${(data.references || []).join('\n')}</p>`)}
                </div>
            `;
        }

        if (templateId === 'john') {
            return `
                <div class="res-body theme-john">
                    ${styles}
                    <div class="res-header" style="border-bottom-color: #6366f1;">
                        <h1 class="res-name" style="color: #6366f1;">${personal.fullName}</h1>
                        <p class="res-title">${personal.professionalTitle}</p>
                        ${commonContact}
                    </div>
                    ${wrap('Profile', `<p>${personal.summary}</p>`)}
                    ${wrap('Experience', expHtml)}
                    ${wrap('Education', eduHtml)}
                    ${wrap('Skills', `<ul>${(data.skills || []).map(s => `<li>${s}</li>`).join('')}</ul>`)}
                    ${wrap('Software', `<ul>${(data.software || []).map(s => `<li>${s.name}: ${s.label}</li>`).join('')}</ul>`)}
                </div>
            `;
        }

        if (templateId === 'juliana') {
            return `
                <div class="res-body theme-juliana">
                    ${styles}
                    <div style="background: #f8f9fa; padding: 20px;">
                        ${personal.profilePhoto ? `<img src="${personal.profilePhoto}" style="width: 100%; aspect-ratio: 1; border-radius: 50%; object-fit: cover; margin-bottom: 20px; border: 5px solid #fff; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">` : `<div style="width: 100%; aspect-ratio: 1; border-radius: 50%; background: #ddd; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; color: #777;">Photo</div>`}
                        <h2 style="margin-top:0;">Contact</h2>
                        <p>${personal.email}<br>${personal.phone}<br>${personal.location}</p>
                        <h3>Education</h3>
                        ${eduHtml}
                        <h3>Expertise</h3>
                        <ul style="padding-left:15px;">${(data.expertise || []).map(e => `<li>${e}</li>`).join('')}</ul>
                        <h3>Language</h3>
                        ${(data.languages || []).join(', ')}
                    </div>
                    <div>
                        <h1 class="res-name">${personal.fullName}</h1>
                        <p class="res-title">${personal.professionalTitle}</p>
                        ${wrap('About Me', `<p>${personal.summary}</p>`)}
                        ${wrap('Work Experience', expHtml)}
                        ${wrap('References', `<p>${(data.references || []).join('<br>')}</p>`)}
                    </div>
                </div>
            `;
        }

        if (templateId === 'amanda') {
            return `
                <div class="res-body" style="text-align: center;">
                    ${styles}
                    <h1 class="res-name">${personal.fullName}</h1>
                    <div style="margin: 10px 0;">${personal.email} | ${personal.phone} | ${personal.location}</div>
                    <div style="border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 15px 0; margin: 20px 0;">
                        <h3>Profile</h3>
                        <p>${personal.summary}</p>
                    </div>
                    <div style="text-align: left;">
                        ${wrap('Professional Experience', expHtml)}
                        ${wrap('Education', eduHtml)}
                        ${wrap('Key Skills', `<p>${(data.skills || []).join(' • ')}</p>`)}
                        ${wrap('Professional Awards', `<ul>${(data.awards || []).map(a => `<li>${a}</li>`).join('')}</ul>`)}
                    </div>
                </div>
            `;
        }

        return `<div class="res-body">${styles}<h1>Welcome</h1><p>Select a template to begin</p></div>`;
    };

    const updatePreview = () => {
        const html = renderTemplate(resumeData);
        previewContainer.innerHTML = html;
        finalResumeContainer.innerHTML = html;
    };

    // --- Template Choice ---
    templateCards.forEach(card => {
        card.addEventListener('click', () => {
            activeTemplate = card.dataset.template;
            // When switching template, we use ONLY the demo data for that template
            resumeData = JSON.parse(JSON.stringify(demos[activeTemplate]));
            updateFormFields(activeTemplate);
            showScreen('input');
            updatePreview();
        });
    });

    const showScreen = (name) => {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[name].classList.add('active');

        // Update steppers
        document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
        if (name === 'template') document.getElementById('step1-indicator').classList.add('active');
        if (name === 'input') document.getElementById('step2-indicator').classList.add('active');
        if (name === 'final') document.getElementById('step3-indicator').classList.add('active');

        window.scrollTo(0, 0);
    };

    // Initial Previews in Grid
    const initGrid = () => {
        ['marjorie', 'john', 'juliana', 'amanda'].forEach(id => {
            const el = document.getElementById(`preview-${id}`);
            if (el) el.innerHTML = renderTemplate(demos[id]);
        });
    };

    document.getElementById('go-to-preview').addEventListener('click', () => showScreen('final'));
    document.getElementById('back-to-templates').addEventListener('click', () => showScreen('template'));
    document.getElementById('back-to-editor').addEventListener('click', () => showScreen('input'));

    document.getElementById('download-pdf').addEventListener('click', () => {
        html2pdf().from(finalResumeContainer).save(`${resumeData.personal.fullName}.pdf`);
    });

    initGrid();
});
