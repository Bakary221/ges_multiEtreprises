import { useCompany } from '../utils/CompanyContext';

export const useCompanyTheme = () => {
  const { company } = useCompany();

  const primaryColor = company?.primaryColor || '#4F46E5';
  const secondaryColor = company?.secondaryColor || '#1E40AF';

  // Générer les classes CSS avec les couleurs de l'entreprise
  const theme = {
    // Couleurs principales
    primary: primaryColor,
    secondary: secondaryColor,

    // Classes pour les boutons
    buttonPrimary: `bg-[${primaryColor}] hover:bg-[${primaryColor}CC] text-white`,
    buttonSecondary: `bg-[${secondaryColor}] hover:bg-[${secondaryColor}CC] text-white`,
    buttonOutline: `border border-[${primaryColor}] text-[${primaryColor}] hover:bg-[${primaryColor}] hover:text-white`,

    // Classes pour les cartes et éléments d'interface
    cardHeader: `bg-[${primaryColor}] text-white`,
    cardAccent: `border-l-4 border-[${primaryColor}]`,
    cardHover: `hover:border-[${primaryColor}] hover:shadow-[0_0_0_2px_${primaryColor}20]`,

    // Classes pour les liens actifs
    navActive: `bg-[${primaryColor}20] text-[${primaryColor}] border-r-2 border-[${primaryColor}]`,

    // Classes pour les badges et indicateurs
    badgePrimary: `bg-[${primaryColor}] text-white`,
    badgeSecondary: `bg-[${secondaryColor}] text-white`,

    // Classes pour les inputs focus
    inputFocus: `focus:ring-[${primaryColor}] focus:border-[${primaryColor}]`,

    // Classes pour les tableaux
    tableHeader: `bg-[${primaryColor}] text-white`,
    tableRowHover: `hover:bg-[${primaryColor}10]`,

    // Classes pour les graphiques
    chartPrimary: primaryColor,
    chartSecondary: secondaryColor,

    // Fonction utilitaire pour appliquer une couleur directement
    applyColor: (color) => {
      if (color === 'primary') return primaryColor;
      if (color === 'secondary') return secondaryColor;
      return color;
    },

    // Styles inline pour les éléments dynamiques
    style: {
      primaryBackground: { backgroundColor: primaryColor },
      secondaryBackground: { backgroundColor: secondaryColor },
      primaryText: { color: primaryColor },
      secondaryText: { color: secondaryColor },
      primaryBorder: { borderColor: primaryColor },
      secondaryBorder: { borderColor: secondaryColor },
    }
  };

  return theme;
};