import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description: "Политика обработки персональных данных ИП Кушнерёва Кирилла в соответствии с Федеральным законом № 152-ФЗ.",
  robots: { index: true, follow: false },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 md:px-8 md:py-20">
      <h1 className="font-heading text-4xl font-bold text-ink uppercase tracking-wide mb-2">
        Политика конфиденциальности
      </h1>
      <p className="mb-10 text-sm text-ink-muted">
        Дата публикации: 27 марта 2026 г.
      </p>

      <div className="space-y-10 text-[15px] leading-relaxed text-ink-secondary">

        {/* 1 */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-ink uppercase tracking-wide mb-4">
            1. Оператор персональных данных
          </h2>
          <p className="mb-3">
            Настоящая Политика конфиденциальности (далее — <strong>Политика</strong>) определяет порядок
            обработки и защиты персональных данных пользователей сайта <strong>puppyigrulya.ru</strong>
            (далее — <strong>Сайт</strong>) в соответствии с Федеральным законом от 27.07.2006
            № 152-ФЗ «О персональных данных» (далее — 152-ФЗ), Постановлением Правительства РФ
            от 01.11.2012 № 1119 «Об утверждении требований к защите персональных данных при их
            обработке в информационных системах», а также иными нормативными актами Российской Федерации.
          </p>
          <div className="rounded-xl border border-black/[0.08] bg-[#F8F8F8] p-4 text-sm">
            <p className="font-semibold text-ink mb-1">Оператор персональных данных:</p>
            <p>Индивидуальный предприниматель Кушнерёв Кирилл</p>
            <p>ИНН: 780455456911 &nbsp;|&nbsp; ОГРНИП: 325530000014625</p>
            <p>Адрес: 173007, г. Великий Новгород, ул. Десятинная, д. 8, кв. 21</p>
            <p>
              Email:{" "}
              <a href="mailto:partners@kkushneriov.ru" className="text-brand underline">
                partners@kkushneriov.ru
              </a>
              &nbsp;|&nbsp; Тел: +7 995 234-06-39
            </p>
          </div>
          <p className="mt-3">
            Использование Сайта и оформление заказа означает согласие пользователя
            с условиями настоящей Политики. Если вы не согласны с условиями Политики,
            пожалуйста, воздержитесь от использования Сайта.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-ink uppercase tracking-wide mb-4">
            2. Состав собираемых персональных данных
          </h2>
          <p className="mb-3">
            В процессе оформления заказа Оператор собирает следующие персональные данные:
          </p>
          <ul className="list-disc pl-5 space-y-1 mb-3">
            <li>Фамилия, имя, отчество (ФИО);</li>
            <li>Номер мобильного телефона;</li>
            <li>Адрес электронной почты (email);</li>
            <li>Адрес доставки (населённый пункт, пункт выдачи или адрес курьерской доставки);</li>
            <li>Комментарий к заказу (при наличии).</li>
          </ul>
          <p className="mb-3">
            Технические данные, собираемые автоматически при посещении Сайта:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>IP-адрес устройства;</li>
            <li>Тип и версия браузера, операционная система;</li>
            <li>Данные cookie-файлов (см. раздел 9);</li>
            <li>Реферер (страница, с которой осуществлён переход на Сайт).</li>
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-ink uppercase tracking-wide mb-4">
            3. Цели обработки персональных данных
          </h2>
          <p className="mb-3">
            Персональные данные обрабатываются исключительно в следующих целях:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Исполнение договора купли-продажи</strong> — создание и обработка
              заказа, формирование кассового чека, организация доставки;
            </li>
            <li>
              <strong>Связь с Покупателем</strong> — направление уведомлений о статусе заказа,
              ответы на вопросы и претензии;
            </li>
            <li>
              <strong>Соблюдение требований законодательства</strong> — ведение бухгалтерского
              учёта, исполнение требований 54-ФЗ, хранение документов в установленные законом сроки;
            </li>
            <li>
              <strong>Обеспечение безопасности Сайта</strong> — предотвращение мошеннических
              действий, защита от несанкционированного доступа.
            </li>
          </ul>
          <p className="mt-3">
            Оператор не использует персональные данные в целях маркетинга и рекламы
            без отдельного согласия субъекта.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-ink uppercase tracking-wide mb-4">
            4. Правовые основания обработки
          </h2>
          <p className="mb-3">
            Обработка персональных данных осуществляется на следующих правовых основаниях
            в соответствии с ч. 1 ст. 6 Федерального закона № 152-ФЗ:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>п. 5 ч. 1 ст. 6 152-ФЗ</strong> — обработка необходима для исполнения
              договора, стороной которого является субъект персональных данных
              (оформление и доставка заказа);
            </li>
            <li>
              <strong>п. 6 ч. 1 ст. 6 152-ФЗ</strong> — обработка необходима для исполнения
              полномочий оператора, предусмотренных законодательством (бухгалтерский учёт,
              кассовые операции по 54-ФЗ);
            </li>
            <li>
              <strong>п. 1 ч. 1 ст. 6 152-ФЗ</strong> — согласие субъекта персональных данных,
              выражаемое при оформлении заказа путём подтверждения соглашения с настоящей Политикой.
            </li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-ink uppercase tracking-wide mb-4">
            5. Передача персональных данных третьим лицам
          </h2>
          <p className="mb-3">
            Оператор передаёт персональные данные третьим лицам исключительно в объёме,
            необходимом для исполнения заказа, на основании ч. 3 ст. 6 152-ФЗ:
          </p>
          <ul className="list-disc pl-5 space-y-3 mb-3">
            <li>
              <strong>ООО «СДЭК-Глобал»</strong> (транспортная компания, cdek.ru) —
              ФИО, телефон, адрес доставки для организации доставки товара.
              Политика СДЭК:{" "}
              <a href="https://www.cdek.ru/ru/policy" target="_blank" rel="noopener noreferrer"
                className="text-brand underline">cdek.ru/ru/policy</a>.
            </li>
            <li>
              <strong>ООО НКО «ЮMoney»</strong> (платёжный сервис ЮKassa, yookassa.ru) —
              email, сумма платежа для проведения расчётов и выдачи кассового чека
              в соответствии с 54-ФЗ. Политика ЮKassa:{" "}
              <a href="https://yookassa.ru/docs/support/merchant/payments/checkout/policy" target="_blank"
                rel="noopener noreferrer" className="text-brand underline">yookassa.ru</a>.
            </li>
            <li>
              <strong>Telegram (Telegram Messenger Inc.)</strong> — обезличённые
              данные о заказе (номер, сумма, статус) направляются через Telegram Bot API
              для уведомления Продавца. Персональные данные покупателя (ФИО, телефон)
              передаются оператору в целях обработки заказа.
            </li>
          </ul>
          <p>
            Все указанные третьи лица обрабатывают персональные данные на основании
            собственных политик конфиденциальности и несут самостоятельную ответственность
            за их соблюдение.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-ink uppercase tracking-wide mb-4">
            6. Трансграничная передача данных
          </h2>
          <p>
            Персональные данные Покупателей хранятся на серверах, расположенных
            на территории Российской Федерации. Трансграничная передача персональных
            данных в государства, не обеспечивающие адекватную защиту прав субъектов
            персональных данных, Оператором не осуществляется.
          </p>
          <p className="mt-3">
            Взаимодействие с сервисами Telegram осуществляется исключительно через API
            в части уведомлений о заказах; данная передача относится к обработке
            в целях оказания услуг связи и осуществляется в минимально необходимом объёме.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-ink uppercase tracking-wide mb-4">
            7. Сроки хранения персональных данных
          </h2>
          <p className="mb-3">
            Персональные данные хранятся в течение следующих сроков:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Данные заказа и платёжные документы</strong> — не менее 5 (пяти) лет
              с момента совершения операции в соответствии со ст. 29 Федерального закона
              от 06.12.2011 № 402-ФЗ «О бухгалтерском учёте» и требованиями НК РФ;
            </li>
            <li>
              <strong>Данные договора (оферты)</strong> — не менее 3 (трёх) лет
              со дня исполнения договора согласно сроку исковой давности (ст. 196 ГК РФ);
            </li>
            <li>
              <strong>Технические логи (IP-адреса, действия на сайте)</strong> — до
              90 (девяноста) дней, если иное не требуется законодательством;
            </li>
            <li>
              <strong>При отзыве согласия</strong> — до 30 дней с момента получения отзыва,
              если иное не предусмотрено законом.
            </li>
          </ul>
          <p className="mt-3">
            По истечении срока хранения персональные данные уничтожаются в порядке,
            установленном действующим законодательством.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-ink uppercase tracking-wide mb-4">
            8. Права субъекта персональных данных
          </h2>
          <p className="mb-3">
            В соответствии со ст. 14–17 Федерального закона № 152-ФЗ вы вправе:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-3">
            <li>
              <strong>Получить информацию</strong> об обработке ваших персональных данных
              (ст. 14 152-ФЗ): состав данных, цели, источники, сроки хранения;
            </li>
            <li>
              <strong>Потребовать уточнения</strong> неполных, неточных или устаревших
              персональных данных (ст. 21 152-ФЗ);
            </li>
            <li>
              <strong>Потребовать удаления</strong> или блокировки персональных данных
              в случаях, предусмотренных ст. 21 152-ФЗ;
            </li>
            <li>
              <strong>Отозвать согласие</strong> на обработку персональных данных (ст. 9 152-ФЗ).
              Отзыв согласия не влияет на обработку данных, необходимую для исполнения заключённого
              договора и исполнения требований законодательства;
            </li>
            <li>
              <strong>Обжаловать действия Оператора</strong> в Федеральную службу по надзору
              в сфере связи, информационных технологий и массовых коммуникаций (Роскомнадзор):
              rkn.gov.ru.
            </li>
          </ul>
          <p>
            Для реализации своих прав направьте письменный запрос по email:{" "}
            <a href="mailto:partners@kkushneriov.ru" className="text-brand underline">
              partners@kkushneriov.ru
            </a>
            . Оператор рассматривает обращения в течение 30 (тридцати) дней с момента
            получения, если иной срок не предусмотрен законодательством.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-ink uppercase tracking-wide mb-4">
            9. Файлы cookie и технические данные
          </h2>
          <p className="mb-3">
            Сайт использует cookie-файлы — небольшие текстовые файлы, сохраняемые браузером
            на устройстве пользователя. Cookie используются для:
          </p>
          <ul className="list-disc pl-5 space-y-1 mb-3">
            <li>обеспечения работы корзины (хранение состава заказа);</li>
            <li>сохранения сессии авторизации в административной части Сайта;</li>
            <li>обеспечения безопасности (защита от CSRF-атак).</li>
          </ul>
          <p className="mb-3">
            Сайт не использует сторонние аналитические cookie (Google Analytics, Яндекс.Метрика
            и аналогичные) без отдельного согласия пользователя.
          </p>
          <p>
            Вы можете отключить cookie в настройках браузера, однако это может повлиять
            на функциональность Сайта (в частности, на работу корзины).
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-ink uppercase tracking-wide mb-4">
            10. Меры защиты персональных данных
          </h2>
          <p className="mb-3">
            Оператор принимает необходимые организационные и технические меры для
            обеспечения безопасности персональных данных от несанкционированного
            доступа, изменения, раскрытия или уничтожения в соответствии с требованиями
            Постановления Правительства РФ от 01.11.2012 № 1119:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>передача данных осуществляется исключительно по защищённому соединению HTTPS;</li>
            <li>доступ к базе данных ограничен и защищён паролем;</li>
            <li>административная часть Сайта доступна только авторизованным лицам.</li>
          </ul>
        </section>

        {/* 11 */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-ink uppercase tracking-wide mb-4">
            11. Изменение Политики
          </h2>
          <p>
            Оператор вправе вносить изменения в настоящую Политику конфиденциальности.
            Актуальная версия всегда доступна по адресу:{" "}
            <Link href="/privacy" className="text-brand underline">
              puppyigrulya.ru/privacy
            </Link>
            . Продолжение использования Сайта после опубликования изменений означает
            согласие с новой редакцией Политики.
          </p>
        </section>

        {/* Контакты */}
        <section className="rounded-2xl border border-black/[0.08] bg-[#F8F8F8] p-6">
          <h2 className="font-heading text-2xl font-bold text-ink uppercase tracking-wide mb-4">
            Контакты оператора
          </h2>
          <div className="text-sm space-y-1">
            <p>
              <span className="text-ink-muted">Наименование:</span>{" "}
              <span className="text-ink font-medium">ИП Кушнерёв Кирилл</span>
            </p>
            <p>
              <span className="text-ink-muted">ИНН:</span>{" "}
              <span className="text-ink font-medium">780455456911</span>
            </p>
            <p>
              <span className="text-ink-muted">ОГРНИП:</span>{" "}
              <span className="text-ink font-medium">325530000014625</span>
            </p>
            <p>
              <span className="text-ink-muted">Адрес:</span>{" "}
              <span className="text-ink font-medium">
                173007, г. Великий Новгород, ул. Десятинная, д. 8, кв. 21
              </span>
            </p>
            <p>
              <span className="text-ink-muted">Email:</span>{" "}
              <a href="mailto:partners@kkushneriov.ru" className="text-brand underline font-medium">
                partners@kkushneriov.ru
              </a>
            </p>
            <p>
              <span className="text-ink-muted">Телефон:</span>{" "}
              <span className="text-ink font-medium">+7 995 234-06-39</span>
            </p>
            <p className="mt-3 text-ink-muted text-xs">
              По вопросам обработки персональных данных вы также вправе обратиться в
              Роскомнадзор: <a href="https://rkn.gov.ru" target="_blank" rel="noopener noreferrer"
                className="text-brand underline">rkn.gov.ru</a>.
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}
