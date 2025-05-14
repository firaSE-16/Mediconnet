import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  Form, 
  Input, 
  DatePicker, 
  Select, 
  message, 
  Row, 
  Col, 
  Typography,
  Spin,
  Alert,
  Space
} from 'antd';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const NewRegistration = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hospitalID, setHospitalID] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRes = await fetch('http://localhost:5500/api/auth/me', {
          credentials: 'include',
        });
        
        if (!userRes.ok) throw new Error("Failed to fetch user info");
        
        const userData = await userRes.json();
        console.log(userData)

        if (!userData.hospitalId) {
          throw new Error("Hospital ID not found in user data");
        }
        
        
        setHospitalID(userData.hospitalId);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const onFinish = async (values) => {
    if (!hospitalID) {
      message.error('Hospital ID is missing. Please try again later.');
      return;
    }

    setSubmitting(true);
    setError(null);
    
    try {
      const formattedData = {
        ...values,
        hospitalID,
        dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
        emergencyContact: {
          name: values.emergencyContact?.name || '',
          relation: values.emergencyContact?.relation || '',
          phone: values.emergencyContact?.phone || ''
        }
      };

      const response = await axios.post(
        'http://localhost:5500/api/reception/register-patient',
        formattedData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.success) {
        message.success('Patient registered successfully!');
        form.resetFields();
        navigate('/receptionist/registration');
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to register patient. Please check your data.';
      
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const validatePhoneNumber = (_, value) => {
    if (!value) {
      return Promise.reject('Please input your phone number!');
    }
    if (!/^\d{10,15}$/.test(value)) {
      return Promise.reject('Please enter a valid phone number (10-15 digits)');
    }
    return Promise.resolve();
  };

  const validateFaydaID = (_, value) => {
    if (!value) {
      return Promise.reject('Please input Fayda ID!');
    }
    if (!/^[a-zA-Z0-9]{8,20}$/.test(value)) {
      return Promise.reject('Fayda ID must be 8-20 alphanumeric characters');
    }
    return Promise.resolve();
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" tip="Loading registration form..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Alert
          message="Initialization Error"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: '24px' }}
        />
        <Button 
          type="primary" 
          onClick={() => window.location.reload()}
          style={{ marginRight: '16px' }}
        >
          Try Again
        </Button>
        <Button onClick={() => navigate('/receptionist/registration')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card 
        title={
          <Space>
            <Title level={3} style={{ margin: 0 }}>New Patient Registration</Title>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              Hospital ID: {hospitalID}
            </Text>
          </Space>
        }
        bordered={false}
        extra={
          <Button 
            type="default" 
            onClick={() => navigate('/receptionist/registration')}
            style={{ borderRadius: '4px' }}
          >
            Back to Patient Search
          </Button>
        }
        headStyle={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '16px' }}
        bodyStyle={{ padding: '24px 0' }}
      >
        {error && (
          <Alert 
            message="Registration Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: '24px' }}
          />
        )}

        <Spin spinning={submitting} tip="Registering patient...">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            style={{ maxWidth: '800px', margin: '0 auto' }}
            initialValues={{
              gender: 'Male'
            }}
          >
            <Title level={4} style={{ marginBottom: '24px', color: '#1890ff' }}>
              Basic Information
            </Title>
            
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="Fayda ID"
                  name="faydaID"
                  rules={[
                    { required: true },
                    { validator: validateFaydaID }
                  ]}
                  validateTrigger="onBlur"
                >
                  <Input 
                    placeholder="Enter unique Fayda ID" 
                    size="large" 
                    allowClear
                    prefix={<i className="anticon anticon-idcard" />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Date of Birth"
                  name="dateOfBirth"
                  rules={[{ required: true, message: 'Please select date of birth!' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }} 
                    size="large" 
                    disabledDate={current => current && current > moment().endOf('day')}
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[
                    { required: true, message: 'Please input first name!' },
                    { min: 2, message: 'First name must be at least 2 characters' },
                    { max: 50, message: 'First name cannot exceed 50 characters' }
                  ]}
                >
                  <Input 
                    placeholder="Patient's first name" 
                    size="large" 
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[
                    { required: true, message: 'Please input last name!' },
                    { min: 2, message: 'Last name must be at least 2 characters' },
                    { max: 50, message: 'Last name cannot exceed 50 characters' }
                  ]}
                >
                  <Input 
                    placeholder="Patient's last name" 
                    size="large" 
                    allowClear
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="Gender"
                  name="gender"
                  rules={[{ required: true }]}
                >
                  <Select 
                    placeholder="Select gender" 
                    size="large"
                    optionFilterProp="children"
                  >
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Contact Number"
                  name="contactNumber"
                  rules={[
                    { required: true },
                    { validator: validatePhoneNumber }
                  ]}
                  validateTrigger="onBlur"
                >
                  <Input 
                    placeholder="Patient's phone number" 
                    size="large" 
                    allowClear
                    addonBefore="+1"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Full Address"
              name="address"
              rules={[
                { required: true, message: 'Please input address!' },
                { min: 10, message: 'Address must be at least 10 characters' },
                { max: 200, message: 'Address cannot exceed 200 characters' }
              ]}
            >
              <TextArea 
                rows={3} 
                placeholder="Street address, city, state, and postal code" 
                size="large" 
                allowClear
                showCount
                maxLength={200}
              />
            </Form.Item>

            <Title level={4} style={{ marginBottom: '24px', color: '#1890ff' }}>
              Emergency Contact Information
            </Title>
            
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  label="Full Name"
                  name={['emergencyContact', 'name']}
                  rules={[
                    { required: true, message: 'Please input emergency contact name!' },
                    { min: 3, message: 'Name must be at least 3 characters' }
                  ]}
                >
                  <Input 
                    placeholder="Contact's full name" 
                    size="large" 
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Relationship"
                  name={['emergencyContact', 'relation']}
                  rules={[{ required: true, message: 'Please select relationship!' }]}
                >
                  <Select 
                    placeholder="Select relationship" 
                    size="large"
                    optionFilterProp="children"
                  >
                    <Option value="Parent">Parent</Option>
                    <Option value="Spouse">Spouse</Option>
                    <Option value="Sibling">Sibling</Option>
                    <Option value="Child">Child</Option>
                    <Option value="Relative">Relative</Option>
                    <Option value="Friend">Friend</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Phone Number"
                  name={['emergencyContact', 'phone']}
                  rules={[
                    { required: true },
                    { validator: validatePhoneNumber }
                  ]}
                  validateTrigger="onBlur"
                >
                  <Input 
                    placeholder="Contact's phone number" 
                    size="large" 
                    allowClear
                    addonBefore="+1"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Title level={4} style={{ marginBottom: '24px', color: '#1890ff' }}>
              Medical Information
            </Title>

            <Form.Item
              label={<Text>Medical History <Text type="secondary">(Optional)</Text></Text>}
              name="medicalHistory"
              rules={[
                { max: 500, message: 'Medical history cannot exceed 500 characters' }
              ]}
            >
              <TextArea 
                rows={4} 
                placeholder="Known medical conditions, allergies, current medications, etc." 
                size="large" 
                allowClear
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: '32px', textAlign: 'center' }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
                size="large"
                style={{ 
                  width: '220px', 
                  height: '44px', 
                  borderRadius: '6px',
                  fontWeight: '500',
                  fontSize: '16px'
                }}
                disabled={submitting}
              >
                {submitting ? 'Processing Registration...' : 'Register Patient'}
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default NewRegistration;