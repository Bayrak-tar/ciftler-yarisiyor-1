import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';

type RoundType = 'common_sense' | 'most_popular' | 'general_knowledge';
type CommonSenseAnswerType = 'text' | 'time' | 'number';

interface GeneralKnowledgeQuestion {
  category: string;
  questionText: string;
  correctAnswer: string;
  choices: string[];
}

interface QuestionDoc {
  id?: string;
  roundType: RoundType;
  questionText?: string;
  answerType?: CommonSenseAnswerType; // sadece common_sense için
  answers?: string[];
  extra?: any;
  questions?: GeneralKnowledgeQuestion[];
}

const initialForm: QuestionDoc = {
  roundType: 'common_sense',
  questionText: '',
  answerType: 'text',
  answers: ['', '', '', ''],
  extra: {},
  questions: [
    { category: '', questionText: '', correctAnswer: '', choices: ['', '', '', ''] },
  ],
};

const AdminPanel: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionDoc[]>([]);
  const [form, setForm] = useState<QuestionDoc>(initialForm);
  const [editId, setEditId] = useState<string | null>(null);

  const questionsRef = collection(db, 'questions');

  const fetchQuestions = async () => {
    const snapshot = await getDocs(questionsRef);
    setQuestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as QuestionDoc));
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, idx?: number, subIdx?: number) => {
    const { name, value } = e.target;
    if (name === 'roundType') {
      // roundType değişince formu sıfırla
      setForm({ ...initialForm, roundType: value as RoundType });
    } else if (form.roundType === 'most_popular' && name.startsWith('answer')) {
      const i = Number(name.replace('answer', ''));
      const newAnswers = [...(form.answers || [])];
      newAnswers[i] = value;
      setForm({ ...form, answers: newAnswers });
    } else if (form.roundType === 'most_popular' && name === 'correctAnswer') {
      setForm({ ...form, extra: { ...form.extra, correctAnswer: value } });
    } else if (form.roundType === 'general_knowledge' && typeof idx === 'number') {
      // Alt sorular için
      const newQuestions = [...(form.questions || [])];
      if (name === 'category' || name === 'questionText' || name === 'correctAnswer') {
        newQuestions[idx][name] = value;
      } else if (name.startsWith('choice')) {
        const cIdx = Number(name.replace('choice', ''));
        newQuestions[idx].choices[cIdx] = value;
      }
      setForm({ ...form, questions: newQuestions });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleAddGeneralKnowledge = () => {
    setForm({
      ...form,
      questions: [
        ...(form.questions || []),
        { category: '', questionText: '', correctAnswer: '', choices: ['', '', '', ''] },
      ],
    });
  };

  const handleRemoveGeneralKnowledge = (idx: number) => {
    const newQuestions = [...(form.questions || [])];
    newQuestions.splice(idx, 1);
    setForm({ ...form, questions: newQuestions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let data: any = { roundType: form.roundType };
    if (form.roundType === 'common_sense') {
      data.questionText = form.questionText;
      data.answerType = form.answerType;
      data.extra = { scoringType: 'similarity' };
    } else if (form.roundType === 'most_popular') {
      data.questionText = form.questionText;
      data.answers = form.answers;
      data.extra = { correctAnswer: form.extra?.correctAnswer };
    } else if (form.roundType === 'general_knowledge') {
      data.questions = form.questions;
    }
    if (editId) {
      await updateDoc(doc(db, 'questions', editId), data);
      setEditId(null);
    } else {
      await addDoc(questionsRef, data);
    }
    setForm(initialForm);
    fetchQuestions();
  };

  const handleEdit = (q: QuestionDoc) => {
    setForm(q);
    setEditId(q.id!);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'questions', id));
    fetchQuestions();
  };

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Soru Ekle / Düzenle</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
        <div>
          <label>Raund Tipi:</label>
          <select name="roundType" value={form.roundType} onChange={handleChange} style={{ width: '100%', marginBottom: 8 }}>
            <option value="common_sense">Ortak Akıl</option>
            <option value="most_popular">En Popüler Cevap</option>
            <option value="general_knowledge">Genel Kültür</option>
          </select>
        </div>
        {/* Ortak Akıl */}
        {form.roundType === 'common_sense' && (
          <>
            <div>
              <label>Soru Metni:</label>
              <input name="questionText" value={form.questionText || ''} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }} />
            </div>
            <div>
              <label>Cevap Tipi:</label>
              <select name="answerType" value={form.answerType} onChange={handleChange} style={{ width: '100%', marginBottom: 8 }}>
                <option value="text">Metin</option>
                <option value="time">Saat</option>
                <option value="number">Sayı</option>
              </select>
            </div>
          </>
        )}
        {/* En Popüler Cevap */}
        {form.roundType === 'most_popular' && (
          <>
            <div>
              <label>Soru Metni:</label>
              <input name="questionText" value={form.questionText || ''} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }} />
            </div>
            <div>
              <label>Cevaplar:</label>
              {(form.answers || []).map((cevap, idx) => (
                <input
                  key={idx}
                  name={`answer${idx}`}
                  value={cevap}
                  onChange={handleChange}
                  placeholder={`Şık ${String.fromCharCode(65 + idx)}`}
                  required
                  style={{ width: '100%', marginBottom: 4 }}
                />
              ))}
            </div>
            <div>
              <label>Doğru Cevap:</label>
              <input name="correctAnswer" value={form.extra?.correctAnswer || ''} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }} />
            </div>
          </>
        )}
        {/* Genel Kültür */}
        {form.roundType === 'general_knowledge' && (
          <div>
            <label>Genel Kültür Soruları:</label>
            {(form.questions || []).map((q, idx) => (
              <div key={idx} style={{ border: '1px solid #ccc', padding: 8, marginBottom: 8, borderRadius: 4 }}>
                <input name="category" value={q.category} onChange={e => handleChange(e, idx)} placeholder="Kategori" required style={{ width: '100%', marginBottom: 4 }} />
                <input name="questionText" value={q.questionText} onChange={e => handleChange(e, idx)} placeholder="Soru Metni" required style={{ width: '100%', marginBottom: 4 }} />
                <input name="correctAnswer" value={q.correctAnswer} onChange={e => handleChange(e, idx)} placeholder="Doğru Cevap" required style={{ width: '100%', marginBottom: 4 }} />
                {q.choices.map((c, cIdx) => (
                  <input
                    key={cIdx}
                    name={`choice${cIdx}`}
                    value={c}
                    onChange={e => handleChange(e, idx)}
                    placeholder={`Şık ${String.fromCharCode(65 + cIdx)}`}
                    required
                    style={{ width: '100%', marginBottom: 4 }}
                  />
                ))}
                <button type="button" onClick={() => handleRemoveGeneralKnowledge(idx)} style={{ color: 'red', marginTop: 4 }}>Sil</button>
              </div>
            ))}
            <button type="button" onClick={handleAddGeneralKnowledge}>+ Soru Ekle</button>
          </div>
        )}
        <button type="submit" style={{ marginTop: 8 }}>
          {editId ? 'Güncelle' : 'Ekle'}
        </button>
        {editId && (
          <button type="button" onClick={() => { setForm(initialForm); setEditId(null); }} style={{ marginLeft: 8 }}>
            İptal
          </button>
        )}
      </form>
      <h2>Mevcut Sorular</h2>
      <ul>
        {questions.map(q => (
          <li key={q.id} style={{ marginBottom: 16, border: '1px solid #ccc', padding: 8, borderRadius: 4 }}>
            <b>Raund: {q.roundType}</b><br />
            {q.roundType === 'common_sense' && (
              <>
                <span>{q.questionText}</span><br />
                <span>Cevap Tipi: {q.answerType === 'text' ? 'Metin' : q.answerType === 'time' ? 'Saat' : 'Sayı'}</span>
              </>
            )}
            {q.roundType === 'most_popular' && (
              <>
                <span>{q.questionText}</span>
                <ul>
                  {(q.answers || []).map((cevap, idx) => (
                    <li key={idx}>{String.fromCharCode(65 + idx)}: {cevap} {q.extra?.correctAnswer === cevap ? '(Doğru)' : ''}</li>
                  ))}
                </ul>
              </>
            )}
            {q.roundType === 'general_knowledge' && (
              <ul>
                {(q.questions || []).map((s, idx) => (
                  <li key={idx}>
                    <b>{s.category}:</b> {s.questionText}<br />
                    Şıklar: {s.choices.join(', ')}<br />
                    Doğru: {s.correctAnswer}
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => handleEdit(q)}>Düzenle</button>
            <button onClick={() => handleDelete(q.id!)} style={{ marginLeft: 8, color: 'red' }}>Sil</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;
