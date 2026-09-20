export const actTemplates = [
    {
        id: 'admission',
        name: 'Акт допуска',
        version: 1,
        updatedAt: '2026-09-06T00:00:00.000Z',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; font-size: 14px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 18px;">АКТ ДОПУСКА</h1>
          <p style="margin: 5px 0; color: #666;">№ {{clientReportId}}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #000; width: 30%;"><strong>Лицевой счёт:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{personalAccount}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Потребитель:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{customerName}}</td>
          </tr>
        </table>

        <h3 style="margin-bottom: 10px; font-size: 14px;">ПРИБОР УЧЁТА</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #000; width: 30%;"><strong>Тип счётчика:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{meterBefore.type}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Номер счётчика:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{meterBefore.number}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Показания:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{metering.oldReading}}</td>
          </tr>
        </table>

        <h3 style="margin-bottom: 10px; font-size: 14px;">ПЛОМБИРОВКА</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #000; width: 30%;"><strong>Место установки пломбы:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{metering.sealLocation}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Номер пломбы:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{metering.sealNumber}}</td>
          </tr>
        </table>

        <h3 style="margin-bottom: 10px; font-size: 14px;">КОНТАКТЫ</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Телефон:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{consumerContact.phoneNumber}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Доп. телефон:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{consumerContact.phoneNumber2}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>E-mail:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{consumerContact.email}}</td>
          </tr>
        </table>

        <div style="margin-top: 40px; display: flex; justify-content: space-between;">
          <div style="width: 45%;">
            <div style="border-bottom: 1px solid #000; height: 40px;"></div>
            <p style="font-size: 12px; text-align: center; margin: 5px 0;">Подпись потребителя</p>
          </div>
          <div style="width: 45%;">
            <div style="border-bottom: 1px solid #000; height: 40px;"></div>
            <p style="font-size: 12px; text-align: center; margin: 5px 0;">Подпись исполнителя</p>
          </div>
        </div>
      </div>
    `,
        requiredFields: [
            'clientReportId',
            'personalAccount',
            'customerName',
            'meterBefore.type',
            'meterBefore.number',
            'metering.oldReading',
            'metering.sealLocation',
            'metering.sealNumber',
            'consumerContact.phoneNumber',
            'consumerContact.phoneNumber2',
            'consumerContact.email',
        ],
    },
    {
        id: 'replacement',
        name: 'Акт замены',
        version: 1,
        updatedAt: '2026-09-06T00:00:00.000Z',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; font-size: 14px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 18px;">АКТ ЗАМЕНЫ ПРИБОРА УЧЁТА</h1>
          <p style="margin: 5px 0; color: #666;">№ {{clientReportId}}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #000; width: 30%;"><strong>Лицевой счёт:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{personalAccount}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Потребитель:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{customerName}}</td>
          </tr>
        </table>

        <h3 style="margin-bottom: 10px; font-size: 14px;">ДЕМОНТИРОВАННЫЙ ПРИБОР</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #000; width: 30%;"><strong>Тип счётчика:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{meterBefore.type}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Заводской номер:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{meterBefore.number}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Показания на момент демонтажа:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{metering.oldReading}}</td>
          </tr>
        </table>

        <h3 style="margin-bottom: 10px; font-size: 14px;">УСТАНОВЛЕННЫЙ ПРИБОР</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #000; width: 30%;"><strong>Тип счётчика:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{metering.newMeterType}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Заводской номер:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{metering.newMeterNumber}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Показания на момент установки:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{metering.installationReading}}</td>
          </tr>
        </table>

        <h3 style="margin-bottom: 10px; font-size: 14px;">ПЛОМБИРОВКА</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #000; width: 30%;"><strong>Место установки пломбы:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{metering.sealLocation}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Номер пломбы:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{metering.sealNumber}}</td>
          </tr>
        </table>

        <h3 style="margin-bottom: 10px; font-size: 14px;">КОНТАКТЫ</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Телефон:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{consumerContact.phoneNumber}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Доп. телефон:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{consumerContact.phoneNumber2}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>E-mail:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{consumerContact.email}}</td>
          </tr>
        </table>

        <div style="margin-top: 40px; display: flex; justify-content: space-between;">
          <div style="width: 45%;">
            <div style="border-bottom: 1px solid #000; height: 40px;"></div>
            <p style="font-size: 12px; text-align: center; margin: 5px 0;">Подпись потребителя</p>
          </div>
          <div style="width: 45%;">
            <div style="border-bottom: 1px solid #000; height: 40px;"></div>
            <p style="font-size: 12px; text-align: center; margin: 5px 0;">Подпись исполнителя</p>
          </div>
        </div>
      </div>
    `,
        requiredFields: [
            'clientReportId',
            'personalAccount',
            'customerName',
            'meterBefore.type',
            'meterBefore.number',
            'metering.oldReading',
            'metering.newMeterType',
            'metering.newMeterNumber',
            'metering.installationReading',
            'metering.sealLocation',
            'metering.sealNumber',
            'consumerContact.phoneNumber',
            'consumerContact.phoneNumber2',
            'consumerContact.email',
        ],
    },
    {
        id: 'inspection',
        name: 'Акт осмотра',
        version: 1,
        updatedAt: '2026-09-06T00:00:00.000Z',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; font-size: 14px;">
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
          <h1 style="margin: 0; font-size: 20px;">АКТ ОСМОТРА</h1>
          <p style="margin: 5px 0; color: #666;">от {{clientReportId}}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <p style="margin: 0 0 5px 0;"><strong>Заказчик:</strong> {{customerName}}</p>
          <p style="margin: 0 0 5px 0;"><strong>Лицевой счёт:</strong> {{personalAccount}}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="background-color: #f0f0f0;">
            <td style="padding: 10px; border: 1px solid #000; text-align: center;"><strong>Параметр</strong></td>
            <td style="padding: 10px; border: 1px solid #000; text-align: center;"><strong>Значение</strong></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #000;">Тип прибора</td>
            <td style="padding: 10px; border: 1px solid #000;">{{meterBefore.type}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #000;">Номер прибора</td>
            <td style="padding: 10px; border: 1px solid #000;">{{meterBefore.number}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #000;">Показания</td>
            <td style="padding: 10px; border: 1px solid #000;">{{metering.oldReading}}</td>
          </tr>
        </table>

        <div style="margin-top: 30px; text-align: center;">
          <p style="font-size: 12px; color: #666;">Подпись исполнителя: ______________</p>
        </div>
      </div>
    `,
        requiredFields: [
            'clientReportId',
            'customerName',
            'personalAccount',
            'meterBefore.type',
            'meterBefore.number',
            'metering.oldReading',
        ],
    },
    {
        id: 'compact',
        name: 'Компактный акт',
        version: 1,
        updatedAt: '2026-09-06T00:00:00.000Z',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 15px; font-size: 12px;">
        <div style="text-align: center; margin-bottom: 15px;">
          <h1 style="margin: 0; font-size: 16px;">АКТ</h1>
          <p style="margin: 3px 0; color: #666;">№ {{clientReportId}}</p>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 15px;">
          <div style="flex: 1; min-width: 45%;">
            <strong>Счёт:</strong> {{personalAccount}}
          </div>
          <div style="flex: 1; min-width: 45%;">
            <strong>Клиент:</strong> {{customerName}}
          </div>
          <div style="flex: 1; min-width: 45%;">
            <strong>Тип:</strong> {{meterBefore.type}}
          </div>
          <div style="flex: 1; min-width: 45%;">
            <strong>№:</strong> {{meterBefore.number}}
          </div>
          <div style="flex: 1; min-width: 45%;">
            <strong>Пломба:</strong> {{metering.sealNumber}}
          </div>
          <div style="flex: 1; min-width: 45%;">
            <strong>Тел:</strong> {{consumerContact.phoneNumber}}
          </div>
        </div>

        <div style="margin-top: 20px; display: flex; justify-content: space-between;">
          <div style="width: 40%; text-align: center;">
            <div style="border-bottom: 1px solid #000; height: 25px;"></div>
            <p style="font-size: 10px; margin: 3px 0;">Потребитель</p>
          </div>
          <div style="width: 40%; text-align: center;">
            <div style="border-bottom: 1px solid #000; height: 25px;"></div>
            <p style="font-size: 10px; margin: 3px 0;">Исполнитель</p>
          </div>
        </div>
      </div>
    `,
        requiredFields: [
            'clientReportId',
            'personalAccount',
            'customerName',
            'meterBefore.type',
            'meterBefore.number',
            'metering.sealNumber',
            'consumerContact.phoneNumber',
        ],
    },
    {
        id: 'detailed',
        name: 'Детальный акт',
        version: 1,
        updatedAt: '2026-09-06T00:00:00.000Z',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 25px; font-size: 13px;">
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 3px double #000; padding-bottom: 15px;">
          <h1 style="margin: 0; font-size: 22px;">ДЕТАЛЬНЫЙ АКТ</h1>
          <p style="margin: 8px 0; color: #666;">Регистрационный номер: {{clientReportId}}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td colspan="2" style="padding: 10px; border: 1px solid #000; background-color: #e8e8e8; text-align: center;">
              <strong>ИНФОРМАЦИЯ О ЗАКАЗЧИКЕ</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000; width: 40%;"><strong>ФИО:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{customerName}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Лицевой счёт:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{personalAccount}}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 10px; border: 1px solid #000; background-color: #e8e8e8; text-align: center;">
              <strong>ДАННЫЕ СНЯТОГО ПРИБОРА</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Тип счётчика:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{meterBefore.type}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Заводской номер:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{meterBefore.number}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Снятые показания:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{metering.oldReading}}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 10px; border: 1px solid #000; background-color: #e8e8e8; text-align: center;">
              <strong>ДАННЫЕ УСТАНОВЛЕННОГО ПРИБОРА</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Тип нового счётчика:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{metering.newMeterType}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Заводской номер:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{metering.newMeterNumber}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Показания при установке:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{metering.installationReading}}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 10px; border: 1px solid #000; background-color: #e8e8e8; text-align: center;">
              <strong>ПЛОМБИРОВКА</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Место установки пломбы:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{metering.sealLocation}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Номер пломбы:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{metering.sealNumber}}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 10px; border: 1px solid #000; background-color: #e8e8e8; text-align: center;">
              <strong>КОНТАКТНЫЕ ДАННЫЕ</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Телефон 1:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{consumerContact.phoneNumber}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>Телефон 2:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{consumerContact.phoneNumber2}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #000;"><strong>E-mail:</strong></td>
            <td style="padding: 8px; border: 1px solid #000;">{{consumerContact.email}}</td>
          </tr>
        </table>

        <div style="margin-top: 30px; display: flex; justify-content: space-between;">
          <div style="width: 45%;">
            <div style="border-bottom: 1px solid #000; height: 40px;"></div>
            <p style="font-size: 12px; text-align: center; margin: 5px 0;">Подпись заказчика</p>
          </div>
          <div style="width: 45%;">
            <div style="border-bottom: 1px solid #000; height: 40px;"></div>
            <p style="font-size: 12px; text-align: center; margin: 5px 0;">Подпись исполнителя</p>
          </div>
        </div>
      </div>
    `,
        requiredFields: [
            'clientReportId',
            'customerName',
            'personalAccount',
            'meterBefore.type',
            'meterBefore.number',
            'metering.oldReading',
            'metering.newMeterType',
            'metering.newMeterNumber',
            'metering.installationReading',
            'metering.sealLocation',
            'metering.sealNumber',
            'consumerContact.phoneNumber',
            'consumerContact.phoneNumber2',
            'consumerContact.email',
        ],
    },
    {
        id: 'two-column',
        name: 'Двухколоночный акт',
        version: 1,
        updatedAt: '2026-09-06T00:00:00.000Z',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; font-size: 13px;">
        <h1 style="text-align: center; margin: 0 0 20px 0; font-size: 18px;">АКТ РАБОТ</h1>
        <p style="text-align: center; color: #666; margin: 0 0 15px 0;">№ {{clientReportId}}</p>

        <div style="display: flex; gap: 20px;">
          <div style="flex: 1;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px; border-bottom: 1px solid #000;">ЗАКАЗЧИК</h3>
            <p style="margin: 5px 0;"><strong>ФИО:</strong> {{customerName}}</p>
            <p style="margin: 5px 0;"><strong>Счёт:</strong> {{personalAccount}}</p>
          </div>
          <div style="flex: 1;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px; border-bottom: 1px solid #000;">ПРИБОР</h3>
            <p style="margin: 5px 0;"><strong>Тип:</strong> {{meterBefore.type}}</p>
            <p style="margin: 5px 0;"><strong>Номер:</strong> {{meterBefore.number}}</p>
            <p style="margin: 5px 0;"><strong>Показания:</strong> {{metering.oldReading}}</p>
          </div>
        </div>

        <div style="margin-top: 20px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; border-bottom: 1px solid #000;">УСТАНОВКА</h3>
          <div style="display: flex; gap: 20px;">
            <div style="flex: 1;">
              <p style="margin: 5px 0;"><strong>Новый тип:</strong> {{metering.newMeterType}}</p>
              <p style="margin: 5px 0;"><strong>Новый номер:</strong> {{metering.newMeterNumber}}</p>
            </div>
            <div style="flex: 1;">
              <p style="margin: 5px 0;"><strong>Пломба:</strong> {{metering.sealNumber}}</p>
              <p style="margin: 5px 0;"><strong>Место:</strong> {{metering.sealLocation}}</p>
            </div>
          </div>
        </div>

        <div style="margin-top: 20px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; border-bottom: 1px solid #000;">КОНТАКТЫ</h3>
          <p style="margin: 5px 0;"><strong>Тел:</strong> {{consumerContact.phoneNumber}} | <strong>Тел2:</strong> {{consumerContact.phoneNumber2}}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> {{consumerContact.email}}</p>
        </div>

        <div style="margin-top: 30px; display: flex; justify-content: space-between;">
          <div style="width: 45%;">
            <div style="border-bottom: 1px solid #000; height: 30px;"></div>
            <p style="font-size: 11px; text-align: center; margin: 3px 0;">Заказчик</p>
          </div>
          <div style="width: 45%;">
            <div style="border-bottom: 1px solid #000; height: 30px;"></div>
            <p style="font-size: 11px; text-align: center; margin: 3px 0;">Исполнитель</p>
          </div>
        </div>
      </div>
    `,
        requiredFields: [
            'clientReportId',
            'customerName',
            'personalAccount',
            'meterBefore.type',
            'meterBefore.number',
            'metering.oldReading',
            'metering.newMeterType',
            'metering.newMeterNumber',
            'metering.sealNumber',
            'metering.sealLocation',
            'consumerContact.phoneNumber',
            'consumerContact.phoneNumber2',
            'consumerContact.email',
        ],
    },
    {
        id: 'minimal',
        name: 'Минимальный акт',
        version: 1,
        updatedAt: '2026-09-06T00:00:00.000Z',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 15px; font-size: 12px;">
        <h1 style="text-align: center; margin: 0 0 10px 0; font-size: 16px;">АКТ</h1>
        <p style="text-align: center; margin: 0 0 15px 0; color: #666;">{{clientReportId}}</p>

        <p style="margin: 5px 0;"><strong>Клиент:</strong> {{customerName}}</p>
        <p style="margin: 5px 0;"><strong>Счёт:</strong> {{personalAccount}}</p>
        <p style="margin: 5px 0;"><strong>ПУ:</strong> {{meterBefore.type}} №{{meterBefore.number}}</p>
        <p style="margin: 5px 0;"><strong>Показания:</strong> {{metering.oldReading}}</p>
        <p style="margin: 5px 0;"><strong>Пломба:</strong> {{metering.sealNumber}}</p>
        <p style="margin: 5px 0;"><strong>Тел:</strong> {{consumerContact.phoneNumber}}</p>

        <div style="margin-top: 20px; display: flex; justify-content: space-around;">
          <div style="text-align: center;">
            <div style="border-bottom: 1px solid #000; width: 80px; height: 20px;"></div>
            <p style="font-size: 10px; margin: 2px 0;">Подпись</p>
          </div>
        </div>
      </div>
    `,
        requiredFields: [
            'clientReportId',
            'customerName',
            'personalAccount',
            'meterBefore.type',
            'meterBefore.number',
            'metering.oldReading',
            'metering.sealNumber',
            'consumerContact.phoneNumber',
        ],
    },
];
