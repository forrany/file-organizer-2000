## Активация лицензии

Общие настройки
Конфигурация лицензии

Лицензионный ключ File Organizer: Требуется ключ активации для разблокировки полной функциональности

Индикатор статуса показывает, активирована ли лицензия в данный момент
Кнопка "Получить лицензию" перенаправляет на страницу покупки
Поддержка open-source разработки доступна через веб-сайт

<img width="1840" alt="Screenshot 2024-11-13 at 14 41 20" src="https://github.com/user-attachments/assets/9a491629-0b00-463e-a9dd-808e55ebe74e">

## Что делать при возникновении ошибки

Создайте [новый issue с шагами для воспроизведения](https://github.com/different-ai/file-organizer-2000/issues/new/choose)

Вы также можете включить режим "debug" и добавить его к вложениям issue. Но будьте осторожны, это может раскрыть конфиденциальную информацию, перепроверьте её.
<img width="1840" alt="Screenshot 2024-11-12 at 16 59 18" src="https://github.com/user-attachments/assets/5d047bf6-205f-4b98-b67c-df408eef285f">

## Как сохранять веб-статьи с помощью Obsidian Web Clipper

Obsidian web clipper отлично работает с File Organizer 2000, делая не только автоматическую организацию ваших вырезок, но и их форматирование простым!

Просто установите [веб-клиппер]([url](https://obsidian.md/clipper)) и настройте его на сохранение файлов в _FileOrganizer2000/Inbox

![image](https://github.com/user-attachments/assets/8117cc17-4665-40ac-987f-191ae35e7484)

Вы также можете комбинировать его с "AI Templates" и автоматически форматировать определенные статьи с помощью ИИ.

## Я получаю ошибку в органайзере

1. Слишком много папок
Наиболее вероятная проблема: у вас слишком много папок. Проверьте этот экран в настройках (Доступ к хранилищу)

![image](https://github.com/user-attachments/assets/ce2d8436-1cb5-42c5-9b8b-c066ea6db832)

Попробуйте игнорировать некоторые папки и повторите попытку. Если это работает, значит, мы не можем обработать все ваши папки.

Если вы импортируете файлы из другой системы, попробуйте поместить их все в отдельную папку, пометить её как игнорируемую и делать это пошагово.

## Отладка проблем с боковой панелью органайзера

Откройте настройки разработчика, перезагрузите боковую панель органайзера, набрав refresh, и покажите нам ваши логи и вкладки сети.

Вы можете навести курсор на сетевые логи, чтобы узнать, какой API вызывает проблемы (см. скриншот ниже)
<img width="509" alt="Screenshot 2024-11-12 at 15 52 10" src="https://github.com/user-attachments/assets/1dfba391-813b-4e9c-91cd-02d2945b8461">

затем вы можете просмотреть заголовки, полезную нагрузку и предварительный просмотр
<img width="508" alt="Screenshot 2024-11-12 at 15 52 56" src="https://github.com/user-attachments/assets/4efe3ae4-43d4-47ae-8393-93d0161133b3">

сделайте скриншот каждого раздела и отправьте нам.

## Я получаю ошибку "Too many requests"

Попробуйте организовывать меньше файлов за раз. Обычно мы рекомендуем максимум 100 файлов.

## У меня проблемы при использовании Inbox

Попробуйте отключить "Document Auto Formatting" в inbox. Автоформатирование иногда может вызывать неожиданное поведение inbox.

<img width="1840" alt="Screenshot 2024-11-12 at 14 23 59" src="https://github.com/user-attachments/assets/d78149c0-233f-4498-a7b2-185e971b3c77">

## Генерация диаграмм из рукописных заметок

Обновите раздел обработки изображений, чтобы заставить ИИ извлекать mermaid js из вашего изображения.

<img width="784" alt="Screenshot 2024-11-12 at 15 17 38" src="https://github.com/user-attachments/assets/dc2885d3-611d-4bb9-99a0-d2578cbc1c25">

## Что такое Доступ к хранилищу?

Доступ к хранилищу (Vault Access) в File Organizer 2000 относится к способности плагина управлять и организовывать файлы в определенных папках или путях вашего хранилища Obsidian. Настраивая параметры доступа к хранилищу, вы можете указать, какие папки плагин должен отслеживать и организовывать. Это позволяет вам контролировать, где именно работает File Organizer, гарантируя, что он влияет только на те части вашего хранилища, которые вы хотите.

## Как я могу сохранить конфиденциальность определенных файлов?

Вы можете сохранить конфиденциальность определенных файлов, используя функцию "Игнорировать папки" в настройках File Organizer 2000. Вот как:
	1.	Перейдите в настройки File Organizer: Перейдите в раздел "Доступ к хранилищу" или "Конфигурация путей".
	2.	Найдите настройку "Игнорировать папки": Вы найдете опцию с названием "Игнорировать папки."
	3.	Укажите папки для игнорирования: Введите пути к папкам, которые вы хотите, чтобы плагин игнорировал, разделяя их запятыми (например, PrivateFolder1,SecretsFolder2). Если вы хотите, чтобы плагин игнорировал все папки, вы можете ввести *.

Указав эти папки, плагин исключит их из процессов организации, обеспечивая неприкосновенность ваших конфиденциальных или личных файлов.

## Поддерживаете ли вы Front Matter?

Да, File Organizer 2000 поддерживает front matter. Плагин предоставляет возможность добавлять похожие теги непосредственно во front matter ваших Markdown файлов. Чтобы включить эту функцию:
	1.	Перейдите на вкладку "Настройки организации": В настройках плагина перейдите в раздел "Настройки организации".
	2.	Включите "Добавлять похожие теги во front matter": Найдите настройку "Добавлять похожие теги во front matter" и включите её.

Когда эта опция включена, любые похожие теги, сгенерированные плагином, будут добавлены в раздел front matter ваших файлов, помогая вам поддерживать метаданные организованными и легко доступными.

## Как работает интеграция с Fabric?

Интеграция Fabric в File Organizer 2000 позволяет улучшить форматирование ваших документов, используя структуры промптов в стиле Fabric. Вот как это работает:
	1.	Включите форматирование Fabric:
	•	Перейдите на вкладку "Эксперимент" в настройках плагина.
	•	Найдите опцию "Включить форматирование в стиле Fabric" и включите её.
	2.	Загрузите промпты Fabric:
	•	После включения появится Менеджер промптов Fabric.
	•	Используйте Менеджер промптов Fabric для загрузки или обновления промптов из репозитория Fabric.
	•	Эти промпты хранятся в назначенной папке, указанной в ваших настройках (например, fabricPaths).
	3.	Применение промптов Fabric:
	•	Загруженные промпты используются для форматирования ваших документов в соответствии с методологиями Fabric.
	•	При обработке файлов плагин применяет эти промпты для улучшения организации и структуры.