import { getAccessToken } from './firebaseAuth';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  modifiedTime?: string;
}

export const GoogleWorkspaceService = {
  /**
   * Google Docs: Create a new Google Document with project documentation / README
   */
  async createDocument(title: string, textContent: string): Promise<{ id: string; url: string }> {
    const token = await getAccessToken();
    if (!token) throw new Error('Google Workspace authentication required.');

    // 1. Create empty document
    const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    if (!createRes.ok) {
      const errData = await createRes.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Failed to create Google Doc (${createRes.status})`);
    }

    const doc = await createRes.json();
    const docId = doc.documentId;

    // 2. Insert text content
    if (textContent.trim()) {
      const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: textContent,
              },
            },
          ],
        }),
      });

      if (!updateRes.ok) {
        console.warn('Doc created, but failed to insert body text:', await updateRes.text());
      }
    }

    return {
      id: docId,
      url: `https://docs.google.com/document/d/${docId}/edit`,
    };
  },

  /**
   * Google Sheets: Create a spreadsheet populated with Data Dictionary / Curated Dataset rows
   */
  async createSpreadsheet(
    title: string,
    headers: string[],
    rows: string[][]
  ): Promise<{ id: string; url: string }> {
    const token = await getAccessToken();
    if (!token) throw new Error('Google Workspace authentication required.');

    const sheetData = [
      headers.map((h) => ({ userEnteredValue: { stringValue: h } })),
      ...rows.map((row) =>
        row.map((cell) => ({ userEnteredValue: { stringValue: String(cell) } }))
      ),
    ];

    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: { title },
        sheets: [
          {
            properties: { title: 'Data Dictionary' },
            data: [
              {
                startRow: 0,
                startColumn: 0,
                rowData: sheetData.map((row) => ({ values: row })),
              },
            ],
          },
        ],
      }),
    });

    if (!createRes.ok) {
      const errData = await createRes.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Failed to create Google Sheet (${createRes.status})`);
    }

    const sheet = await createRes.json();
    const sheetId = sheet.spreadsheetId;

    return {
      id: sheetId,
      url: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
    };
  },

  /**
   * Google Forms: Create a research data collection or quality assessment questionnaire
   */
  async createForm(
    title: string,
    description: string,
    questions: Array<{ title: string; type: 'TEXT' | 'PARAGRAPH_TEXT' | 'CHOICE'; options?: string[] }>
  ): Promise<{ id: string; editUrl: string; responderUrl?: string }> {
    const token = await getAccessToken();
    if (!token) throw new Error('Google Workspace authentication required.');

    // 1. Create form
    const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        info: {
          title,
          documentTitle: title,
        },
      }),
    });

    if (!createRes.ok) {
      const errData = await createRes.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Failed to create Google Form (${createRes.status})`);
    }

    const form = await createRes.json();
    const formId = form.formId;

    // 2. Add description and questions
    const requests: any[] = [
      {
        updateFormInfo: {
          info: { description },
          updateMask: 'description',
        },
      },
    ];

    questions.forEach((q, idx) => {
      if (q.type === 'CHOICE' && q.options) {
        requests.push({
          createItem: {
            item: {
              title: q.title,
              questionItem: {
                question: {
                  required: true,
                  choiceQuestion: {
                    type: 'RADIO',
                    options: q.options.map((opt) => ({ value: opt })),
                  },
                },
              },
            },
            location: { index: idx },
          },
        });
      } else {
        requests.push({
          createItem: {
            item: {
              title: q.title,
              questionItem: {
                question: {
                  required: false,
                  textQuestion: {
                    paragraph: q.type === 'PARAGRAPH_TEXT',
                  },
                },
              },
            },
            location: { index: idx },
          },
        });
      }
    });

    const updateRes = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    if (!updateRes.ok) {
      console.warn('Form created, but items update returned:', await updateRes.text());
    }

    return {
      id: formId,
      editUrl: `https://docs.google.com/forms/d/${formId}/edit`,
      responderUrl: form.responderUri,
    };
  },

  /**
   * Google Drive: List files in user's Drive with matching types or recent research files
   */
  async listFiles(): Promise<DriveFileItem[]> {
    const token = await getAccessToken();
    if (!token) throw new Error('Google Workspace authentication required.');

    const query = encodeURIComponent("trashed = false");
    const fields = encodeURIComponent("files(id, name, mimeType, webViewLink, iconLink, modifiedTime)");

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?pageSize=25&q=${query}&fields=${fields}&orderBy=modifiedTime desc`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Failed to fetch Drive files (${res.status})`);
    }

    const data = await res.json();
    return data.files || [];
  },
};
