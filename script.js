const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');

// PARA CADA ITEM DA SIDEBAR, ADICIONA UM EVENTO DE CLIQUE
allSideMenu.forEach(item=> {
	const li = item.parentElement;
	item.addEventListener('click', function () {
		allSideMenu.forEach(i=> {
			i.parentElement.classList.remove('active');
		})
		li.classList.add('active');
	})
});



// TOGGLE DA SIDEBAR
const menuBar = document.querySelector('#sidebar a .bx.bx-menu');
const sidebar = document.getElementById('sidebar');
menuBar.addEventListener('click', function () {
	sidebar.classList.toggle('hide');
})



// DARK MODE
const switchMode = document.getElementById('switch-mode');
switchMode.addEventListener('change', function () {
	if(this.checked) {
		document.body.classList.add('dark');
	} else {
		document.body.classList.remove('dark');
	}
})



// QUANDO O DOM ESTIVER CARREGADO, INICIALIZA O MODAL E EXIBE A PÁGINA DASHBOARD
document.addEventListener('DOMContentLoaded', () => {
    initModal('dashboard');
    showPage('dashboard');
    fetchTasks();
});



// EXIBE A PÁGINA COM BASE NO ID
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active');
    }
    const sidebarLinks = document.querySelectorAll('#sidebar .side-menu li');
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
    });
    if (pageId === 'dashboard') {
        sidebarLinks[0].classList.add('active');
    } else if (pageId === 'tasks') {
        sidebarLinks[1].classList.add('active');
    }

    // INICIALIZA O MODAL PRA PÁGINA ATUAL
    initModal(pageId);
}



// MODAL DE CRIAR TAREFAS
function initModal(pageId) {
    modal = document.getElementById('taskModal');
    const closeModalButton = document.getElementById('closeModalButton');
    const cancelButton = document.getElementById('cancelButton');
    const taskForm = document.getElementById('taskForm');

    let openModalButton;

    // DEFINE O BOTÃO DE MODAL CORRETO BASEADO NA PÁGINA
    if (pageId === 'dashboard') {
        openModalButton = document.getElementById('openModalButtonDashboard');
    } else if (pageId === 'tasks') {
        openModalButton = document.getElementById('openModalButtonTasks');
    }

    // EVENTOS PARA CLIQUE DE ABRIR, FECHAR, CANCELAR E AO CLICAR FORA DO MODAL
    openModalButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });
    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    cancelButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // REMOVE LISTENER DE SUBMIT EXISTENTE ANTES DE ADICIONAR UM NOVO
    taskForm.removeEventListener('submit', handleSubmit);
    taskForm.addEventListener('submit', handleSubmit);
}



// ENVIA OS DADOS DO FORM PARA O BACKEND
function handleSubmit(event) {
    event.preventDefault();
    const taskData = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        deadline: document.getElementById('taskDeadline').value,
        priority: document.getElementById('taskPriority').value,
        responsible: document.getElementById('taskResp').value,
        project: document.getElementById('taskProject').value
    };

    fetch('https://back-end-taskmanager.vercel.app/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData) // CONVERTE OS DADOS PARA JSON
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Tarefa criada com sucesso!');
            modal.style.display = 'none'; // FECHA O MODAL APÓS SUCESSO
            taskForm.reset();
            location.reload();
        } else {
            alert('Erro ao criar tarefa: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Erro ao criar tarefa:', error);
    });
}



// BUSCA TAREFAS NO BACKEND
function fetchTasks() {
    fetch('https://back-end-taskmanager.vercel.app/tasks') // REQUISIÇÃO GET
        .then(response => response.json()) // CONVERTE A RESPOSTA EM JSON
        .then(data => {
            const taskTable = document.getElementById('taskTableBody');
            taskTable.innerHTML = ''; // LIMPA A TABELA ANTES DE PREENCHÊ-LA

            // PERCORRE OS DADOS E CRIA UMA LINHA PRA CADA TAREFA
            data.forEach(task => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', task.id); // ATRIBUI TASK ID À LINHA 
                row.innerHTML = `
                    <td>${task.title}</td>
                    <td><span class="priority-box ${task.priority.toLowerCase()}">${task.priority}</span></td>
                    <td>${task.project}</td>
                    <td><span class="status-box ${task.status.toLowerCase()}">${task.status}</span></td>
                    <td>${task.responsible}</td>
                    <td>${formatDate(task.deadline)}</td>
                    <td>
                        <i class='bx bx-edit edit-task'></i>
                        <i class='bx bx-show-alt view-task'></i>
                        <i class='bx bx-trash delete-task'></i>
                    </td>
                `;
                taskTable.appendChild(row);
            });

            // ADICIONA EVENTOS DE CLIQUE PARA OS ÍCONES NA TABELA
            attachTaskEvents();
        })
        .catch(error => {
            console.error('Erro ao buscar tarefas:', error);
        });
}



// FORMATA AS DATAS NO FORMATO DD/MM/YYYY
function formatDate(dateString) {
    const date = new Date(dateString); // CONVERTE A STRING DE DATA PRA UM OBJETO DATE
    if (isNaN(date)) {
        console.error('Data inválida:', dateString);
        return ''; // RETORNA STRING VAZIA SE A DATA FOR INVÁLIDA
    }
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`; // RETORNA A DATA FORMATADA
}



// RENDERIZA UMA LINHA DE TAREFA NA TABELA
function renderTask(task) {
    const deadlineFormatted = formatDate(task.deadline);
    
    const taskRow = `
        <tr>
            <td>${task.title}</td>
            <td><span class="priority-box ${task.priority.toLowerCase()}">${task.priority}</span></td>
            <td>${task.project}</td>
            <td><span class="status-box ${task.status.toLowerCase()}">${task.status}</span></td>
            <td>${task.responsible}</td> <!-- Assumindo que 'responsible' seja uma propriedade da task -->
            <td>${deadlineFormatted}</td> <!-- Data formatada -->
            <td>
                <i class='bx bx-edit edit-task'></i>
                <i class='bx bx-show-alt view-task'></i>
                <i class='bx bx-trash delete-task'></i>
            </td>
        </tr>
    `;

    document.getElementById('taskTableBody').innerHTML += taskRow;
}



// ATUALIZA A LINHA DA TAREFA DEPOIS DE UMA EDIÇÃO
function updateTaskRow(row, updatedTask) {
    row.cells[0].textContent = updatedTask.title;
    row.cells[1].textContent = updatedTask.priority;
    row.cells[2].textContent = updatedTask.project;
    row.cells[4].textContent = updatedTask.responsible;

    // FORMATA A DATA ANTES DE ATUALIZAR A CÉLULA
    const deadlineDate = new Date(updatedTask.deadline);
    if (!isNaN(deadlineDate)) {
        row.cells[5].textContent = deadlineDate.toLocaleDateString('pt-BR');
    } else {
        row.cells[5].textContent = 'Data Inválida';
    }
}



// LIDA COM A EDIÇÃO DE UMA TAREFA
function handleEditTask(taskId) {
    const title = document.getElementById('editTaskTitle').value;
    const description = document.getElementById('editTaskDescription').value;
    const deadline = document.getElementById('editTaskDeadline').value;
    const priority = document.getElementById('editTaskPriority').value;
    const responsible = document.getElementById('editTaskResp').value;
    const project = document.getElementById('editTaskProject').value;
    const status = document.getElementById('editTaskStatus').value;

    fetch(`/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title,
            description,
            deadline,
            priority,
            responsible,
            project,
            status,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Tarefa editada com sucesso!');
            location.reload();
        } else {
            alert('Erro ao editar tarefa.');
        }
    })
    .catch(error => console.error('Erro:', error));
}



// ANEXA EVENTOS AOS ÍCONES DAS TAREFAS
function attachTaskEvents() {

    // DELETAR TAREFAS
    document.querySelectorAll('.delete-task').forEach(icon => {
        icon.addEventListener('click', function() {
            const row = this.closest('tr');
            const taskId = row.dataset.id;

            fetch(`https://back-end-taskmanager.vercel.app/tasks/${taskId}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    row.remove();
                    alert('Tarefa deletada!');
                } else {
                    alert('Erro ao deletar a tarefa.');
                }
            })
            .catch(error => {
                console.error('Erro ao deletar a tarefa:', error);
            });
        });
    });

    // VISUALIZAR TAREFAS
    document.querySelectorAll('.view-task').forEach(icon => {
        icon.addEventListener('click', function() {
            const row = this.closest('tr');

            // EXTRAI OS DADOS A PARTIR DAS CÉLULAS NA TABELA
            const title = row.cells[0].textContent;
            const priority = row.cells[1].textContent;
            const project = row.cells[2].textContent;
            const status = row.cells[3].textContent;
            const responsible = row.cells[4].textContent;
            const deadline = row.cells[5].textContent;

            // ATUALIZA O CONTEÚDO DO MODAL
            const taskDetails = document.getElementById('taskDetails');
            taskDetails.innerHTML = `
                <p><strong>Título:</strong> ${title}</p>
                <p><strong>Prioridade:</strong> ${priority}</p>
                <p><strong>Projeto:</strong> ${project}</p>
                <p><strong>Status:</strong> ${status}</p>
                <p><strong>Responsável:</strong> ${responsible}</p>
                <p><strong>Prazo:</strong> ${deadline}</p>
            `;

            // ABRIR E FECHAR O MODAL
            const viewModal = document.getElementById('viewTaskModal');
            viewModal.style.display = 'block';
            const closeModal = viewModal.querySelector('.close');
            closeModal.onclick = function() {
                viewModal.style.display = 'none';
            };
            window.onclick = function(event) {
                if (event.target === viewModal) {
                    viewModal.style.display = 'none';
                }
            };
        });
    });

    // EDIÇÃO DE TAREFAS
    document.querySelectorAll('.edit-task').forEach(icon => {
        icon.addEventListener('click', function() {
            const row = this.closest('tr');
            const taskId = row.dataset.id;
    
            // PREENCHE O FORMULÁRIO COM OS DADOS DA TAREFA
            document.getElementById('editTaskTitle').value = row.cells[0].textContent;
            document.getElementById('editTaskPriority').value = row.cells[1].textContent.toLowerCase();
            document.getElementById('editTaskProject').value = row.cells[2].textContent;
            document.getElementById('editTaskStatus').value = row.cells[3].textContent;
            document.getElementById('editTaskResp').value = row.cells[4].textContent;

            // FORMATA A DATA
            const deadlineText = row.cells[5].textContent;
            const [day, month, year] = deadlineText.split('/');
            const formattedDeadline = `${year}-${month}-${day}`;
    
            document.getElementById('editTaskDeadline').value = formattedDeadline;
    
            // ABRIR E FECHAR O MODAL
            const editModal = document.getElementById('editTaskModal');
            editModal.style.display = 'block';
            document.getElementById('closeEditModalButton').onclick = () => editModal.style.display = 'none';
            document.getElementById('editCancelButton').onclick = () => editModal.style.display = 'none';
            window.onclick = function(event) {
                if (event.target === editModal) {
                    editModal.style.display = 'none';
                }
            };
    
            // LIDA COM O ENVIO DO MODAL DE EDIÇÃO
            document.getElementById('editTaskForm').onsubmit = function(e) {
                e.preventDefault();
                handleEditTask(taskId); // CHAMA A FUNÇÃO PARA ATUALIZAÇÃO DA TAREFA
                editModal.style.display = 'none'; // FECHA O MODAL
                showPage('tasks'); 
            };
        });
    });
}



// DEFININDO RÓTULOS E DADOS INICIAIS DO GRÁFICO [DASHBOARD]
let labels = ['01/06', '02/06', '03/06', '04/06', '05/06', '06/06', '07/06'];
let data = [1, 2, 3, 2, 4, 2, 3];

// RENDERIZA O GRÁFICO
const taskChart = new Chart(document.getElementById('taskChart'), {
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
            label: 'Tarefas Concluídas',
            data: data,
            borderColor: 'rgba(0, 200, 83, 1)',
            backgroundColor: 'rgba(74, 216, 148, 0)',
            fill: false,
            tension: 0.4,
            borderWidth: 4
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 5
                }
            },
            y: {
                ticks: {
                    beginAtZero: true,
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    }
});



// MUDA OS RÓTULOS E DADOS CONFORME INTERVALO ESCOLHIDO [DASHBOARD]
document.getElementById('timeRangeSelect').addEventListener('change', function() {
    const selectedValue = this.value;

    if (selectedValue === '7') {
        labels = ['01/06', '02/06', '03/06', '04/06', '05/06', '06/06', '07/06'];
        data = [1, 2, 3, 2, 1, 3, 2];
    } else if (selectedValue === '15') {
        labels = ['01/06', '02/06', '03/06', '04/06', '05/06', '06/06', '07/06', '08/06', '09/06', '10/06', '11/06', '12/06', '13/06', '14/06', '15/06'];
        data = [1, 2, 3, 2, 4, 2, 3, 3, 2, 1, 2, 3, 1, 2, 4];
    } else if (selectedValue === '30') {
        labels = ['01/06', '02/06', '03/06', '04/06', '05/06', '06/06', '07/06', '08/06', '09/06', '10/06', '11/06', '12/06', '13/06', '14/06', '15/06', '16/06', '17/06', '18/06', '19/06', '20/06', '21/06', '22/06', '23/06', '24/06', '25/06', '26/06', '27/06', '28/06', '29/06', '30/06'];
        data = [1, 2, 3, 2, 4, 2, 3, 2, 1, 4, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 4, 1, 2, 3, 2, 1, 4, 3];
    }

    taskChart.data.labels = labels;
    taskChart.data.datasets[0].data = data;
    taskChart.update();
});



// FILTRA AS TAREFAS NA TABELA COM BASE NOS CRITÉRIOS ESCOLHIDOS [TAREFAS]
function filterTable() {
    const projectFilter = document.getElementById('projectFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;

    const rows = document.querySelectorAll('#taskTable tbody tr');

    console.log("Filtros aplicados:", { projectFilter, statusFilter, priorityFilter, dateFilter });

    rows.forEach(row => {
        const project = row.cells[2].textContent.trim();
        const status = row.cells[3].textContent.toLowerCase().trim();
        const priority = row.cells[1].textContent.toLowerCase().trim();
        const deadline = row.cells[5].textContent.trim();

        console.log("Valores da linha:", { project, status, priority, deadline });

        let isVisible = true;

        // POR PROJETO
        if (projectFilter && project !== projectFilter) {
            console.log("Filtro de projeto falhou:", { project, projectFilter });
            isVisible = false;
        }

        // POR STATUS
        if (statusFilter && !status.includes(statusFilter)) {
            console.log("Filtro de status falhou:", { status, statusFilter });
            isVisible = false;
        }

        // POR PRIORIDADE
        if (priorityFilter && !priority.includes(priorityFilter)) {
            console.log("Filtro de prioridade falhou:", { priority, priorityFilter });
            isVisible = false;
        }

        // POR DATA
        if (dateFilter) {
            const today = new Date();
            const taskDate = new Date(deadline);

            if (isNaN(taskDate.getTime())) {
                console.log("Data inválida:", deadline);
            } else {
                const daysDifference = (today - taskDate) / (1000 * 3600 * 24); // DIFERENÇA EM DIAS
                if (daysDifference > parseInt(dateFilter, 10)) {
                    console.log("Filtro de data falhou:", { taskDate, daysDifference, dateFilter });
                    isVisible = false;
                }
            }
        }

        // VISIBILIDADE DA LINHA
        row.style.display = isVisible ? '' : 'none';
    });
}



// ORDENA A TABELA COM BASE EM UMA COLUNA ESPECÍFICA [TAREFAS]
function sortTable(columnIndex) {
    const table = document.getElementById('taskTable');
    const rows = Array.from(table.rows).slice(1);
    const sortedRows = rows.sort((a, b) => {
        const aText = a.cells[columnIndex].innerText.toLowerCase();
        const bText = b.cells[columnIndex].innerText.toLowerCase();

        // COMPARAÇÃO PARA DEFINIR ORDEM DE CLASSIFICAÇÃO
        if (aText < bText) {
            return -1;
        }
        if (aText > bText) {
            return 1;
        }
        return 0;
    });

    rows.forEach(row => table.deleteRow(1));
    sortedRows.forEach(row => table.tBodies[0].appendChild(row));
}
