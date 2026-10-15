
//FETCH
const API_URL = 'https://jsonplaceholder.typicode.com';

// 1. делаем базовый запрос GET и выводим результат в консоль список пользователей
// 2. обработка ошибок
async function fetchGetUsers() {
    try {
        const response = await fetch(`${API_URL}/users`);
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        const users = await response.json();
        console.log('1-2. [Fetch] Список пользователей:');
        console.log(users);
        return users;
    } catch (error) {
        console.error('2. [Fetch] Ошибка при получении пользователей:', error.message);
    }
}

// 3. POST-запрос
async function fetchCreateUser() {
    try {
        const newUser = {
            name: 'Иван Иванов',
            username: 'ivan_dev',
            email: 'ivan@example.com'
        };

        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify(newUser)
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('3. [Fetch] Результат POST-запроса:', data);
        return data;
    } catch (error) {
        console.error('3. [Fetch] Ошибка POST-запроса:', error.message);
    }
}

// 4. Параллельные запросы через Promise.all()
async function fetchParallelRequests() {
    try {
        const requests = [
            fetch(`${API_URL}/posts/1`).then(res => {
                if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
                return res.json();
            }),
            fetch(`${API_URL}/posts/2`).then(res => {
                if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
                return res.json();
            }),
            fetch(`${API_URL}/posts/3`).then(res => {
                if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
                return res.json();
            })
        ];

        const results = await Promise.all(requests);
        console.log('4. [Fetch] Параллельные запросы через Promise.all():', results);
        return results;
    } catch (error) {
        console.error('4. [Fetch] Ошибка в одном из запросов Promise.all():', error.message);
    }
}

// 5. Promise.allSettled на 5 разных эндпоинтов с падением в ошибку
async function fetchAllSettledRequests() {
    const urls = [
        `${API_URL}/posts/1`,
        `${API_URL}/nonexistent-endpoint-1`, 
        `${API_URL}/users/1`,
        `${API_URL}/nonexistent-endpoint-2`, 
        `${API_URL}/comments/1`
    ];

    const requests = urls.map(async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Статус ${response.status} на URL: ${url}`);
        }
        return await response.json();
    });

    const results = await Promise.allSettled(requests);
    console.log('5. [Fetch] Promise.allSettled (5 эндпоинтов):');
    results.forEach((res, index) => {
        if (res.status === 'fulfilled') {
            console.log(`- Запрос ${index + 1}: Успех (${res.status})`);
        } else {
            console.log(`- Запрос ${index + 1}: Ошибка (${res.status}) -> ${res.reason.message}`);
        }
    });
    return results;
}

// 6. Таймаут обертка, функция будет принимать url, ms. Поработать AbortController
async function fetchWithTimeout(url, ms) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ms);

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error(`Таймаут запроса: превышен лимит в ${ms} мс`);
        }
        throw error;
    }
}

// 7. Повторные запросы при ошибке
async function fetchWithRetry(url, retries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`7. [Fetch] Попытка ${attempt} из ${retries}...`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Ошибка ответа сервера со статусом ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.warn(`7. [Fetch] Попытка ${attempt} провалена: ${error.message}`);
            if (attempt === retries) {
                throw new Error(`Все ${retries} попыток завершились ошибкой: ${error.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// 8. список задач с CRUD на jsonplaceholder
async function fetchCrudTodos() {
    console.log('8. [Fetch] Начинаем CRUD операции:');

    // Create (Создание задачи)
    const createRes = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Новая задача', completed: false, userId: 1 })
    });
    const createdTodo = await createRes.json();
    console.log('- [C]reate: Создано:', createdTodo);

    // Read (Чтение задачи)
    const readRes = await fetch(`${API_URL}/todos/1`);
    const readTodo = await readRes.json();
    console.log('- [R]ead: Получено:', readTodo);

    // Update (Обновление задачи)
    const updateRes = await fetch(`${API_URL}/todos/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...readTodo, completed: true })
    });
    const updatedTodo = await updateRes.json();
    console.log('- [U]pdate: Обновлено:', updatedTodo);

    // Delete (Удаление задачи)
    const deleteRes = await fetch(`${API_URL}/todos/1`, {
        method: 'DELETE'
    });
    console.log('- [D]elete: Статус удаления:', deleteRes.status);
}

// 9. Обработка оффлайн ошибки
async function fetchWithOfflineCheck(url) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.error('9. [Fetch] Оффлайн ошибка: Подключение к сети отсутствует (navigator.onLine === false)!');
        return;
    }

    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('9. [Fetch] Ошибка сети или соединения:', error.message);
    }
}


//AXIOS
// 1. делаем базовый запрос GET и выводим результат в консоль список пользователей
// 2. обработка ошибок
async function axiosGetUsers() {
    try {
        const response = await axios.get(`${API_URL}/users`);
        console.log('1-2. [Axios] Список пользователей:');
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('2. [Axios] Ошибка при получении пользователей:', error.response ? error.response.status : error.message);
    }
}

// 3. POST-запрос
async function axiosCreateUser() {
    try {
        const newUser = {
            name: 'Иван Иванов',
            username: 'ivan_dev',
            email: 'ivan@example.com'
        };

        const response = await axios.post(`${API_URL}/users`, newUser);
        console.log('3. [Axios] Результат POST-запроса:', response.data);
        return response.data;
    } catch (error) {
        console.error('3. [Axios] Ошибка POST-запроса:', error.message);
    }
}

// 4. Параллельные запросы через Promise.all()
async function axiosParallelRequests() {
    try {
        const results = await Promise.all([
            axios.get(`${API_URL}/posts/1`),
            axios.get(`${API_URL}/posts/2`),
            axios.get(`${API_URL}/posts/3`)
        ]);

        const data = results.map(res => res.data);
        console.log('4. [Axios] Параллельные запросы через Promise.all():', data);
        return data;
    } catch (error) {
        console.error('4. [Axios] Ошибка в Promise.all():', error.message);
    }
}

// 5. Promise.allSettled на 5 разных эндпоинтов с падением в ошибку
async function axiosAllSettledRequests() {
    const urls = [
        `${API_URL}/posts/1`,
        `${API_URL}/nonexistent-endpoint-1`,
        `${API_URL}/users/1`,
        `${API_URL}/nonexistent-endpoint-2`,
        `${API_URL}/comments/1`
    ];

    const requests = urls.map(url => axios.get(url));
    const results = await Promise.allSettled(requests);

    console.log('5. [Axios] Promise.allSettled (5 эндпоинтов):');
    results.forEach((res, index) => {
        if (res.status === 'fulfilled') {
            console.log(`- Запрос ${index + 1}: Успех (${res.status})`);
        } else {
            console.log(`- Запрос ${index + 1}: Ошибка (${res.status}) -> ${res.reason.message}`);
        }
    });
    return results;
}

// 6. Таймаут обертка, функция будет принимать url, ms. Поработать AbortController
async function axiosWithTimeout(url, ms) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ms);

    try {
        const response = await axios.get(url, {
            signal: controller.signal
           
        });
        clearTimeout(timeoutId);
        return response.data;
    } catch (error) {
        if (axios.isCancel(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
            throw new Error(`Таймаут запроса: превышен лимит в ${ms} мс`);
        }
        throw error;
    }
}

// 7. Повторные запросы при ошибке
async function axiosWithRetry(url, retries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`7. [Axios] Попытка ${attempt} из ${retries}...`);
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.warn(`7. [Axios] Попытка ${attempt} провалена: ${error.message}`);
            if (attempt === retries) {
                throw new Error(`Все ${retries} попыток завершились ошибкой: ${error.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// 8. список задач с CRUD на jsonplaceholder
async function axiosCrudTodos() {
    console.log('8. [Axios] Начинаем CRUD операции:');

    // Create
    const createRes = await axios.post(`${API_URL}/todos`, {
        title: 'Новая задача Axios',
        completed: false,
        userId: 1
    });
    console.log('- [C]reate: Создано:', createRes.data);

    // Read
    const readRes = await axios.get(`${API_URL}/todos/1`);
    console.log('- [R]ead: Получено:', readRes.data);

    // Update
    const updateRes = await axios.put(`${API_URL}/todos/1`, {
        ...readRes.data,
        completed: true
    });
    console.log('- [U]pdate: Обновлено:', updateRes.data);

    // Delete
    const deleteRes = await axios.delete(`${API_URL}/todos/1`);
    console.log('- [D]elete: Статус удаления:', deleteRes.status);
}

// 9. Обработка оффлайн ошибки
async function axiosWithOfflineCheck(url) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.error('9. [Axios] Оффлайн ошибка: Подключение к сети отсутствует (navigator.onLine === false)!');
        return;
    }

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('9. [Axios] Ошибка сети или соединения:', error.message);
    }
}
