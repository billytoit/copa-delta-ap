import React, { useState } from 'react';
import { ChevronLeft, Gift, Utensils, Heart, Car, ShoppingBag, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BenefitsView = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('Todas');

    const categories = [
        { name: 'Todas', icon: Gift },
        { name: 'Gastronomía', icon: Utensils },
        { name: 'Salud', icon: Heart },
        { name: 'Automotriz', icon: Car },
        { name: 'Shopping', icon: ShoppingBag },
        { name: 'Otros', icon: Globe },
    ];

    const benefits = [
        {
            id: 1,
            category: 'Salud',
            company: 'Hospital Metropolitano',
            benefit: '20% Descuento en Laboratorio',
            description: 'Válido para todos los miembros de Copa Delta presentando su perfil digital.',
            logo: '/logo.png'
        },
        {
            id: 2,
            category: 'Gastronomía',
            company: 'La Pizarra',
            benefit: 'Cerveza Gratis por consumo',
            description: 'Una cerveza artesanal de cortesía por cada plato fuerte.',
            logo: '/logo.png'
        },
        {
            id: 3,
            category: 'Automotriz',
            company: 'Pro Credit Auto',
            benefit: 'Tasa preferencial 10.5%',
            description: 'Financiamiento inmediato para vehículos híbridos y eléctricos.',
            logo: '/sponsor_procredit.png'
        },
        {
            id: 4,
            category: 'Shopping',
            company: 'Delta Sports',
            benefit: '15% en Indumentaria',
            description: 'Descuento en toda la tienda de deportes.',
            logo: '/logo.png'
        }
    ];

    const filteredBenefits = selectedCategory === 'Todas'
        ? benefits
        : benefits.filter(b => b.category === selectedCategory);

    return (
        <div className="fade-in" style={{ paddingBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                <div
                    onClick={() => navigate(-1)}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                    <ChevronLeft color="white" />
                </div>
                <h1 className="title-gradient" style={{ margin: 0, fontSize: '24px' }}>Club Delta</h1>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                Beneficios exclusivos para la comunidad Copa Delta. Canjea tus beneficios mostrando tu perfil digital en los locales asociados.
            </p>

            {/* Categories Scroll */}
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px' }} className="no-scrollbar">
                {categories.map(cat => {
                    const Icon = cat.icon;
                    const isActive = selectedCategory === cat.name;
                    return (
                        <div
                            key={cat.name}
                            onClick={() => setSelectedCategory(cat.name)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 16px',
                                background: isActive ? 'var(--primary)' : 'var(--glass)',
                                borderRadius: '12px',
                                border: '1px solid',
                                borderColor: isActive ? 'var(--primary)' : 'var(--glass-border)',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <Icon size={16} color={isActive ? 'white' : 'var(--text-secondary)'} />
                            <span style={{ fontSize: '13px', fontWeight: isActive ? '700' : '500', color: isActive ? 'white' : 'var(--text-secondary)' }}>
                                {cat.name}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Benefits Grid */}
            <div style={{ display: 'grid', gap: '15px' }}>
                {filteredBenefits.map(benefit => (
                    <div key={benefit.id} className="glass-card" style={{ padding: '20px', display: 'flex', gap: '15px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '-10px',
                            width: '60px',
                            height: '60px',
                            background: 'var(--primary)',
                            opacity: 0.1,
                            borderRadius: '50%'
                        }} />

                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '12px',
                            background: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px',
                            flexShrink: 0
                        }}>
                            <img src={benefit.logo} alt={benefit.company} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {benefit.category}
                                </span>
                            </div>
                            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>{benefit.benefit}</h3>
                            <p style={{ fontSize: '12px', color: 'white', opacity: 0.9, fontWeight: '600', marginBottom: '8px' }}>{benefit.company}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{benefit.description}</p>
                        </div>
                    </div>
                ))}

                {filteredBenefits.length === 0 && (
                    <div style={{ padding: '40px 20px', textAlign: 'center', opacity: 0.5 }}>
                        <Gift size={40} style={{ marginBottom: '10px' }} />
                        <p>Próximamente más beneficios en esta categoría.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BenefitsView;
