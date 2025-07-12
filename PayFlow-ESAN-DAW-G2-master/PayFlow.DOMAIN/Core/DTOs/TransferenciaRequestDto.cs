using System.ComponentModel.DataAnnotations;

namespace PayFlow.DOMAIN.Core.DTOs
{
    public class TransferenciaRequestDto
    {
        [Required(ErrorMessage = "El n�mero de cuenta de destino es requerido.")]
        [StringLength(10, MinimumLength = 10, ErrorMessage = "El n�mero de cuenta debe tener 10 d�gitos.")]
        [RegularExpression(@"^\d{10}$", ErrorMessage = "El n�mero de cuenta debe contener solo d�gitos.")]
        public string? CuentaDestinoNumero { get; set; }

        [Required(ErrorMessage = "El monto es requerido.")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El monto debe ser mayor a cero.")]
        public decimal Monto { get; set; }
    }
}
