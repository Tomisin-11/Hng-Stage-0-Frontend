
    const COLLAPSE_THRESHOLD = 160;

    let state = {
      title:       'Redesign the onboarding flow',
      description: 'Revisit the entire new-user onboarding experience — from sign-up through the first meaningful action. Audit current drop-off analytics, map friction points, prototype revised copy and microcopy, coordinate with the design system team to align component usage, and A/B test at least two variants before shipping. Stakeholder sign-off is required before handoff to engineering.',
      priority:    'High',
      status:      'Pending',
      dueDate:     null,
      isEditing:   false,
      isExpanded:  false,
    };

    let savedState = { ...state };

    const card          = document.getElementById('todo-card');
    const checkbox      = document.getElementById('todo-checkbox');
    const titleText     = document.getElementById('todo-title-text');
    const descText      = document.getElementById('todo-description-text');
    const priorityBadge = document.getElementById('priority-badge-display');
    const priorityLabel = document.getElementById('priority-label-text');
    const statusCtrl    = document.getElementById('status-control');
    const timeText      = document.getElementById('time-remaining-text');
    const editBtn       = document.getElementById('edit-btn');
    const deleteBtn     = document.getElementById('delete-btn');
    const saveBtn       = document.getElementById('save-btn');
    const cancelBtn     = document.getElementById('cancel-btn');
    const editForm      = document.getElementById('edit-form-container');
    const editTitle     = document.getElementById('edit-title');
    const editDesc      = document.getElementById('edit-description');
    const editPriority  = document.getElementById('edit-priority');
    const editDueDate   = document.getElementById('edit-due-date');
    const colSection    = document.getElementById('collapsible-section');
    const expandToggle  = document.getElementById('expand-toggle');
    const expandLabel   = document.getElementById('expand-toggle-label');

    function render() {
      const { title, description, priority, status, dueDate, isEditing, isExpanded } = state;

      titleText.textContent = title;
      descText.textContent = description;

      card.dataset.priority = priority;
      priorityLabel.textContent = priority;
      priorityBadge.setAttribute('aria-label', `Priority: ${priority}`);

      statusCtrl.value = status;
      statusCtrl.dataset.val = status;

      checkbox.checked = (status === 'Done');

      card.classList.toggle('is-done', status === 'Done');

      const needsCollapse = description.length > COLLAPSE_THRESHOLD;
      expandToggle.style.display = needsCollapse ? 'inline-flex' : 'none';

      if (needsCollapse) {
        colSection.classList.toggle('collapsed', !isExpanded);
        colSection.classList.toggle('expanded',  isExpanded);
        expandToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
        expandLabel.textContent = isExpanded ? 'Show less' : 'Show more';
      } else {
        colSection.classList.remove('collapsed');
        colSection.classList.add('expanded');
      }

      editForm.classList.toggle('visible', isEditing);

      updateTime();
    }

    function updateTime() {
      const { dueDate, status } = state;

      if (status === 'Done') {
        timeText.textContent = 'Completed';
        card.classList.remove('is-overdue');
        return;
      }

      if (!dueDate) {
        timeText.textContent = 'No due date';
        card.classList.remove('is-overdue');
        return;
      }

      const now    = Date.now();
      const due    = new Date(dueDate).getTime();
      const diffMs = due - now;
      const abs    = Math.abs(diffMs);
      const overdue = diffMs < 0;

      const mins  = Math.floor(abs / 60000);
      const hours = Math.floor(abs / 3600000);
      const days  = Math.floor(abs / 86400000);

      let label;
      if (abs < 60000)         label = overdue ? 'Overdue by less than a minute' : 'Due in less than a minute';
      else if (abs < 3600000)  label = overdue ? `Overdue by ${mins}m` : `Due in ${mins}m`;
      else if (abs < 86400000) label = overdue ? `Overdue by ${hours}h` : `Due in ${hours}h`;
      else                     label = overdue ? `Overdue by ${days}d` : `Due in ${days}d`;

      timeText.textContent = label;
      card.classList.toggle('is-overdue', overdue);
    }

    checkbox.addEventListener('change', () => {
      state.status = checkbox.checked ? 'Done' : 'Pending';
      render();
    });

    statusCtrl.addEventListener('change', () => {
      state.status = statusCtrl.value;
      render();
    });

    expandToggle.addEventListener('click', () => {
      state.isExpanded = !state.isExpanded;
      render();
    });

    editBtn.addEventListener('click', () => {
      savedState = { ...state };
      editTitle.value    = state.title;
      editDesc.value     = state.description;
      editPriority.value = state.priority;
      editDueDate.value  = state.dueDate
        ? new Date(state.dueDate).toISOString().slice(0, 16)
        : '';

      state.isEditing = true;
      render();

      setTimeout(() => editTitle.focus(), 80);
    });

    cancelBtn.addEventListener('click', () => {
      state = { ...savedState, isEditing: false };
      render();
      editBtn.focus();
    });

    saveBtn.addEventListener('click', () => {
      const newTitle = editTitle.value.trim();
      if (!newTitle) {
        editTitle.focus();
        editTitle.style.borderColor = 'var(--pri-high)';
        editTitle.style.boxShadow   = '0 0 0 3px rgba(212,84,84,.15)';
        setTimeout(() => {
          editTitle.style.borderColor = '';
          editTitle.style.boxShadow   = '';
        }, 1800);
        return;
      }

      state.title       = newTitle;
      state.description = editDesc.value.trim();
      state.priority    = editPriority.value;
      state.dueDate     = editDueDate.value
        ? new Date(editDueDate.value).toISOString()
        : null;
      state.isEditing   = false;
      state.isExpanded  = false;

      render();
      editBtn.focus();
    });

    deleteBtn.addEventListener('click', () => {
      if (!confirm('Delete this task?')) return;
      card.style.transition = 'transform 320ms ease, opacity 320ms ease';
      card.style.transform  = 'scale(.94) translateY(8px)';
      card.style.opacity    = '0';
      setTimeout(() => card.remove(), 350);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && state.isEditing) {
        state = { ...savedState, isEditing: false };
        render();
        editBtn.focus();
      }
    });

    setInterval(updateTime, 45_000);

    const demo = new Date();
    demo.setHours(demo.getHours() - 3);
    state.dueDate = demo.toISOString();

    render();
  