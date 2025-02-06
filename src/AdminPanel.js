import React, { useState, useEffect } from 'react';
import './styles.css';

// GitHub configuration

const GITHUB_OWNER = 'Afsoone';
const GITHUB_REPO = 'mobile';
const SLIDER_PATH = 'app-slider.json';
const TV_PATH = 'tv.json';

// UTF-8 compatible base64 encoding/decoding
const utf8ToBase64 = (str) => {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode('0x' + p1);
  }));
};

const base64ToUtf8 = (str) => {
  return decodeURIComponent(
    atob(str)
      .split('')
      .map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
};

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if(true){
      onLogin(true);
    } else {
      setError('نام کاربری یا رمز عبور اشتباه است');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <img src="./afsoone.png" alt="Afsoone Logo" className="logo" />
        <h1>پنل ادمین افسونه</h1>
        <input
          type="text"
          placeholder="نام کاربری"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          dir="rtl"
        />
        <input
          type="password"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          dir="rtl"
        />
        {error && <div className="error-message">{error}</div>}
        <button type="submit">ورود</button>
      </form>
    </div>
  );
};

const SliderManager = () => {
  const [sliderData, setSliderData] = useState({ sliderSets: [{ set1: [], set2: [] }] });
  const [saveStatus, setSaveStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSliderData();
  }, []);

  const fetchSliderData = async () => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${SLIDER_PATH}`,
        {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch slider data');

      const fileData = await response.json();
      const content = base64ToUtf8(fileData.content);
      const parsedData = JSON.parse(content);

      setSliderData(parsedData);
      setLoading(false);
    } catch (error) {
      console.error('Slider Data Error:', error);
      setSaveStatus('خطا در بارگذاری داده‌ها');
      setLoading(false);
    }
  };

  const updateSlider = (setName, index, field, value) => {
    const newData = { ...sliderData };
    newData.sliderSets[0][setName][index][field] = value;
    setSliderData(newData);
  };

  const saveSliderChanges = async () => {
    try {
      const fileResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${SLIDER_PATH}`,
        {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      const fileInfo = await fileResponse.json();
      const updatedContent = JSON.stringify(sliderData, null, 2);

      const updateResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${SLIDER_PATH}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'Update slider data',
            content: utf8ToBase64(updatedContent),
            sha: fileInfo.sha,
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorBody = await updateResponse.text();
        console.error('Update Error:', errorBody);
        throw new Error('Update failed');
      }

      setSaveStatus('تغییرات با موفقیت ذخیره شد');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Save Slider Changes Error:', error);
      setSaveStatus('خطا در ذخیره تغییرات');
    }
  };

  const renderSliderSet = (setName) => (
    <div className="slider-set">
      <h3>{setName === 'set1' ? 'مجموعه اول' : 'مجموعه دوم'}</h3>
      {sliderData.sliderSets[0][setName].map((slide, index) => (
        <div key={slide.id} className="slider-item">
          <div className="input-group">
            <label >تصویر اسلایدر</label>
            <input
              type="text"
              value={slide.image}
              onChange={(e) => updateSlider(setName, index, 'image', e.target.value)}
              dir="rtl"
            />
          </div>
          <div className="input-group">
            <label>مقصد آیتم</label>
            <input
              type="text"
              value={slide.url}
              onChange={(e) => updateSlider(setName, index, 'url', e.target.value)}
              dir="rtl"
            />
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return <div>در حال بارگذاری...</div>;
  }

  return (
    <div className="tab-content">
      {renderSliderSet('set1')}
      {renderSliderSet('set2')}
      <button className="save-button" onClick={saveSliderChanges}>
        ذخیره تغییرات
      </button>
      {saveStatus && <div className="status-message">{saveStatus}</div>}
    </div>
  );
};

const TVManager = () => {
  const [tvData, setTvData] = useState({ programs: [] });
  const [saveStatus, setSaveStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTVData();
  }, []);

  const fetchTVData = async () => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${TV_PATH}`,
        {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch TV data');

      const fileData = await response.json();
      const content = base64ToUtf8(fileData.content);
      const parsedData = JSON.parse(content);

      setTvData(parsedData);
      setLoading(false);
    } catch (error) {
      console.error('TV Data Error:', error);
      setSaveStatus('خطا در بارگذاری داده‌ها');
      setLoading(false);
    }
  };

  const addProgram = () => {
    const newPrograms = [...tvData.programs, { name: '', url: '' }];
    setTvData({ programs: newPrograms });
  };

  const removeProgram = (index) => {
    const newPrograms = tvData.programs.filter((_, i) => i !== index);
    setTvData({ programs: newPrograms });
  };

  const updateProgram = (index, field, value) => {
    const newData = { ...tvData };
    newData.programs[index][field] = value;
    setTvData(newData);
  };

  const saveTVChanges = async () => {
    try {
      const fileResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${TV_PATH}`,
        {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      const fileInfo = await fileResponse.json();
      const updatedContent = JSON.stringify(tvData, null, 2);

      const updateResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${TV_PATH}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'Update TV programs data',
            content: utf8ToBase64(updatedContent),
            sha: fileInfo.sha,
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorBody = await updateResponse.text();
        console.error('Update Error:', errorBody);
        throw new Error('Update failed');
      }

      setSaveStatus('تغییرات با موفقیت ذخیره شد');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Save TV Changes Error:', error);
      setSaveStatus('خطا در ذخیره تغییرات');
    }
  };

  if (loading) {
    return <div>در حال بارگذاری...</div>;
  }

  return (
    <div className="tab-content">
      {tvData.programs.map((program, index) => (
        <div key={index} className="tv-item">
          <div className="tv-header">
            <h3>برنامه {index + 1}</h3>
            <button className="remove-button" onClick={() => removeProgram(index)}>
              حذف
            </button>
          </div>
          <div className="input-group">
            <label>نام آیتم</label>
            <input
              type="text"
              value={program.name}
              onChange={(e) => updateProgram(index, 'name', e.target.value)}
              dir="rtl"
            />
          </div>
          <div className="input-group">
            <label>لینک محتوا</label>
            <input
              type="text"
              value={program.url}
              onChange={(e) => updateProgram(index, 'url', e.target.value)}
              dir="rtl"
            />
          </div>
        </div>
      ))}
      <button className="add-button" onClick={addProgram}>
        افزودن برنامه جدید
      </button>
      <button className="save-button" onClick={saveTVChanges}>
        ذخیره تغییرات
      </button>
      {saveStatus && <div className="status-message">{saveStatus}</div>}
    </div>
  );
};

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('slider');

  if (!isAuthenticated) {
    return <Login onLogin={setIsAuthenticated} />;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <img src="./afsoone.png" alt="Afsoone Logo" className="logo" /> 
        <h1>پنل ادمین افسونه</h1>
      </div>
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'slider' ? 'active' : ''}`}
          onClick={() => setActiveTab('slider')}
        >
          اسلایدر موبایل
        </button>
        <button
          className={`tab ${activeTab === 'tv' ? 'active' : ''}`}
          onClick={() => setActiveTab('tv')}
        >
          کنداکتور تلویزیون افسونه
        </button>
      </div>
      {activeTab === 'slider' ? <SliderManager /> : <TVManager />}
    </div>
  );
};

export default AdminPanel;