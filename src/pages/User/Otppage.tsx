'use client'

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react'
import Image from '../../assets/otp-image.gif'
import './Otppage.scss'
import axios from 'axios'
import { sendOtpData, resendOtpData } from '../../api/userApi'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'


interface RootState {
    user: {
        email: string;
    };
}

export default function OTPVerification() {
    const [otp, setOtp] = useState(['', '', '', ''])
    const inputRefs = useRef<Array<HTMLInputElement | null>>([null, null, null, null])
    const [timer, setTimer] = useState(60)
    const [isActive, setIsActive] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const email = useSelector((state: RootState) => state.user.email)
    const navigate = useNavigate()


    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;
        if (isActive) {
            intervalId = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer <= 1) {
                        setIsActive(false);
                        if (intervalId) clearInterval(intervalId);
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isActive]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const pastedOtp = pastedData.slice(0, 4).split('');

        if (pastedOtp.every(char => /^\d$/.test(char))) {
            setOtp(pastedOtp.concat(Array(4 - pastedOtp.length).fill('')));
            const lastIndex = Math.min(pastedOtp.length, 3);
            inputRefs.current[lastIndex]?.focus();
        }
    };

    const handleResend = async () => {
        if (!isActive) {
            try {
                console.log(email, 'this is from the front end')
                await resendOtpData(email)
                setTimer(60);
                setIsActive(true);
                setError(null);
                console.log('OTP resent successfully');
            } catch (error) {
                console.error('Error resending OTP:', error);
                setError('Failed to resend OTP. Please try again.');
            }
        }
    };

    const handleSubmit = async () => {
        const otpString = otp.join('')
        if (otpString.length === 4) {
            try {
                const response = await sendOtpData({ email, otpString })
                if (response.status === 200) {
                    console.log('OTP verified successfully')
                    navigate('/login')
                } else {
                    setError('Invalid OTP. Please try again.')
                }
            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    setError(error.response.data.message || 'Invalid OTP. Please try again.')
                } else {
                    console.error('Error verifying OTP:', error)
                    setError('Failed to verify OTP. Please try again.')
                }
            }
        }
    }

    return (
        <div className="otp-verification">
            <div className="otp-content">
                <h1>OTP Verification</h1>
                <div className="illustration">
                    <img src={Image} alt="Otp illustration" />
                </div>
                <div className="otp-inputs">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={digit}
                            ref={(el) => (inputRefs.current[index] = el)}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={index === 0 ? handlePaste : undefined}
                            aria-label={`OTP digit ${index + 1}`}
                        />
                    ))}
                </div>
                {error && <div className="error-message">{error}</div>}
                <div className="resend">
                    {timer > 0 ? (
                        <span>Resend OTP in {timer} seconds</span>
                    ) : (
                        <button onClick={handleResend} className="resend-link" type="button">
                            Resend OTP
                        </button>
                    )}
                </div>
                <button
                    className="submit-button"
                    onClick={handleSubmit}
                    disabled={!otp.every(digit => digit !== '')}
                    type="button"
                >
                    Submit
                </button>
            </div>
        </div>
    );
}

